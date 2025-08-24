from fastapi import APIRouter, HTTPException, BackgroundTasks
from utils.firebase_configuration import db
from datetime import datetime
import random, os, smtplib
from email.mime.text import MIMEText
from pydantic import BaseModel

import importlib.util
import sys
import os
# Add the parent folder (RecruitMind) to Python path
sys.path.append(r"S:\SLIITA\Year 3 UOB\RecruitMind")


model_path = os.path.join(r"S:\SLIITA\Year 3 UOB\RecruitMind", "personality-questionnaire", "load-model.py")
spec = importlib.util.spec_from_file_location("load_model", model_path)
load_model = importlib.util.module_from_spec(spec)
sys.modules["load_model"] = load_model
spec.loader.exec_module(load_model)

router = APIRouter(prefix="/mbti", tags=["MBTI"])

# ========== GET QUESTIONS ==========
@router.get("/questions")
def get_mbti_questions(limit: int = 20):
    docs = list(db.collection("mbti_questions").stream())
    if not docs:
        raise HTTPException(status_code=404, detail="No MBTI questions found")

    # include Firestore doc ID
    questions = [{**d.to_dict(), "id": d.id} for d in docs]

    # shuffle randomly
    random.shuffle(questions)

    # guard: if fewer than requested exist
    if len(questions) < limit:
        limit = len(questions)

    return {"questions": questions[:limit]}


# ========== SUBMIT ANSWERS ==========
class MBTISubmitRequest(BaseModel):
    answers: dict

@router.post("/submit")
def submit_mbti(candidate_id: str, payload: MBTISubmitRequest):
    answers = payload.answers

    # save raw answers
    db.collection("mbti_results").document(candidate_id).set({
        "candidate_id": candidate_id,
        "answers": answers,
        "created_at": datetime.utcnow().isoformat()
    })

    # run MBTI model
    joined_text = " ".join(answers.values())
    mbti_type = load_model.predict_mbti(joined_text)

    # save prediction
    db.collection("mbti_results").document(candidate_id).update({
        "mbti_type": mbti_type
    })

    return {"candidate_id": candidate_id, "mbti_type": mbti_type}


# ========== GET RESULT ==========
@router.get("/result/{candidate_id}")
def get_mbti_result(candidate_id: str):
    doc = db.collection("mbti_results").document(candidate_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Result not found")
    return doc.to_dict()

# ========== EMAIL RESULTS ==========
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT  = int(os.getenv("SMTP_PORT", "587"))

def send_email(to_email: str, mbti_type: str):
    msg = MIMEText(f"Thanks for completing the test.\n\nYour MBTI type is: {mbti_type}")
    msg["Subject"] = "Your MBTI Test Results"
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)

@router.post("/email-results/{candidate_id}")
def email_results(candidate_id: str, background_tasks: BackgroundTasks):
    res_doc = db.collection("mbti_results").document(candidate_id).get()
    if not res_doc.exists:
        raise HTTPException(status_code=404, detail="Results not found")
    mbti_type = res_doc.to_dict().get("mbti_type")

    cand_doc = db.collection("candidates").document(candidate_id).get()
    if not cand_doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")
    email = cand_doc.to_dict().get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email on file")

    background_tasks.add_task(send_email, email, mbti_type)
    return {"message": "Email queued"}
