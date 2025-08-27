# fixed_mbti_router.py - Complete Fixed Backend

from fastapi import APIRouter, HTTPException, BackgroundTasks
from utils.firebase_configuration import db
from datetime import datetime
import random, os, smtplib
from email.mime.text import MIMEText
from pydantic import BaseModel
from typing import Dict, List, Tuple
import statistics

import importlib.util
import sys
import os

# Load your existing ML model
sys.path.append(r"S:\SLIITA\Year 3 UOB\RecruitMind")
model_path = os.path.join(r"S:\SLIITA\Year 3 UOB\RecruitMind", "personality-questionnaire", "load-model.py")
spec = importlib.util.spec_from_file_location("load_model", model_path)
load_model = importlib.util.module_from_spec(spec)
sys.modules["load_model"] = load_model
spec.loader.exec_module(load_model)

router = APIRouter(prefix="/mbti", tags=["MBTI"])

class FixedMBTIScorer:
    """Fixed MBTI scoring with proper dimension calculation"""
    
    def __init__(self):
        # Corrected question weights based on your actual questions
        self.dimension_scoring = {
            "IE": {
                # Extroversion questions (positive = E)
                "I find it easy to start conversations.": 2,
                "I enjoy working in teams.": 1,
                "I gain energy from interacting with people at work.": 2,
                "I would rather work in a team than alone.": 1,
                "I feel energized when presenting my ideas to a group.": 2,
                "I am energized by meeting new people.": 2,
                # Introversion questions (negative = I)  
                "I enjoy spending time alone.": -2,
                "I prefer having a few close work relationships over many casual ones.": -1,
            },
            "NS": {
                # Intuition questions (positive = N)
                "I like trying new experiences.": 2,
                "I prefer jobs that allow creativity over routine tasks.": 2,
                "I often anticipate potential risks before others notice.": 1,
                # Sensing questions (negative = S)
                "I focus more on the present than the future.": -2,
                "I prefer to focus on facts rather than possibilities.": -2,
                "I often notice details that others might miss.": -1,
                "I prefer work that has practical outcomes over abstract ideas.": -2,
            },
            "TF": {
                # Feeling questions (positive = F)
                "I find it easy to empathize with others.": 2,
                "I find it easy to motivate others when they lose focus.": 1,
                "I enjoy solving conflicts between teammates.": 1,
                "I often think about how my decisions affect others.": 2,
                "I enjoy encouraging teammates to share their ideas.": 1,
                # Thinking questions (negative = T)
                "I make decisions based on logic rather than emotions.": -2,
                "I like to take the lead in group projects.": -1,
                "I tend to think through problems logically rather than emotionally.": -2,
            },
            "JP": {
                # Judging questions (negative = J) - FIXED THE SIGNS!
                "I prefer structured plans over spontaneity.": -2,
                "I prefer clear instructions at work.": -1,
                "I prefer detailed tasks over creative brainstorming.": -1,
                "I like setting long-term goals in my job.": -1,
                "I prefer to plan tasks in detail before starting.": -2,
                "I prefer structured schedules rather than flexible ones.": -2,
                "I like to keep my workspace neat and organized.": -1,
                "I prefer to follow established methods rather than invent new ones.": -1,
                "I prefer finishing one task before starting another.": -1,
                "I am motivated by deadlines.": -1,
                "I value traditions and established ways of doing things.": -1,
                "I find it easy to stay focused even with distractions.": -1,
                # Perceiving questions (positive = P)
                "I adapt quickly to unexpected changes at work.": 2,
                "I adapt quickly when plans change.": 2,
                "I enjoy working in fast-paced environments.": 1,
                "I enjoy jobs that allow flexibility and spontaneity.": 2,
                "I prefer collaborating on decisions rather than deciding alone.": 1,
            }
        }

    def calculate_traditional_mbti(self, answers: Dict[str, str]) -> Tuple[str, Dict, Dict]:
        """Calculate MBTI using fixed traditional scoring"""
        
        dimension_scores = {"IE": 0, "NS": 0, "TF": 0, "JP": 0}
        dimension_details = {"IE": [], "NS": [], "TF": [], "JP": []}
        
        # Handle both numeric (1-5) and text responses
        def convert_answer_to_numeric(answer):
            """Convert any answer format to numeric -2 to +2"""
            answer_str = str(answer)
            
            # Handle numeric responses from frontend
            if answer_str in ["1"]:
                return -2  # Strongly Disagree
            elif answer_str in ["2"]:
                return -1  # Disagree
            elif answer_str in ["3"]:
                return 0   # Neutral
            elif answer_str in ["4"]:
                return 1   # Agree
            elif answer_str in ["5"]:
                return 2   # Strongly Agree
            
            # Handle text responses
            text_mapping = {
                "Strongly Disagree": -2,
                "Disagree": -1,
                "Neutral": 0,
                "Agree": 1,
                "Strongly Agree": 2
            }
            return text_mapping.get(answer_str, 0)
        
        # Process each answer
        for question_id, answer in answers.items():
            doc = db.collection("mbti_questions").document(question_id).get()
            if not doc.exists:
                continue
                
            question_data = doc.to_dict()
            question_text = question_data["question"]
            dimension = question_data["dimension"]
            
            answer_value = convert_answer_to_numeric(answer)
            question_weight = self.dimension_scoring.get(dimension, {}).get(question_text, 0)
            question_score = answer_value * question_weight
            
            dimension_scores[dimension] += question_score
            dimension_details[dimension].append({
                "question": question_text,
                "answer": answer,
                "weight": question_weight,
                "score": question_score
            })
        
        # FIXED: Determine MBTI type correctly
        mbti_type = ""
        mbti_type += "I" if dimension_scores["IE"] < 0 else "E"  # Negative = I, Positive = E
        mbti_type += "S" if dimension_scores["NS"] < 0 else "N"  # Negative = S, Positive = N  
        mbti_type += "T" if dimension_scores["TF"] < 0 else "F"  # Negative = T, Positive = F
        mbti_type += "J" if dimension_scores["JP"] < 0 else "P"  # Negative = J, Positive = P
        
        return mbti_type, dimension_scores, dimension_details

def create_personality_description_for_ml(answers):
    """Convert Q&A responses to personality description format for ML model"""
    
    personality_statements = []
    
    # Define answer strength mapping
    def get_statement_strength(answer):
        answer_str = str(answer)
        if answer_str in ["5", "Strongly Agree"]:
            return "strongly"
        elif answer_str in ["4", "Agree"]:
            return ""
        elif answer_str in ["2", "Disagree"]:
            return "don't"
        elif answer_str in ["1", "Strongly Disagree"]:
            return "never"
        else:  # Neutral
            return "sometimes"
    
    for question_id, answer in answers.items():
        doc = db.collection("mbti_questions").document(question_id).get()
        if not doc.exists:
            continue
            
        question = doc.to_dict()["question"]
        strength = get_statement_strength(answer)
        
        # Convert question to personality statement
        if strength == "strongly":
            statement = question  # "I enjoy spending time alone"
        elif strength == "":
            statement = question  # "I enjoy spending time alone"
        elif strength == "don't":
            if "enjoy" in question:
                statement = question.replace("enjoy", "don't enjoy")
            elif "prefer" in question:
                statement = question.replace("prefer", "don't prefer")
            elif "like" in question:
                statement = question.replace("like", "don't like")
            else:
                statement = f"I don't {question.replace('I ', '')}"
        elif strength == "never":
            if "enjoy" in question:
                statement = question.replace("enjoy", "never enjoy")
            elif "prefer" in question:
                statement = question.replace("prefer", "never prefer")
            elif "like" in question:
                statement = question.replace("like", "dislike")
            else:
                statement = f"I never {question.replace('I ', '')}"
        else:  # sometimes
            statement = f"I sometimes {question.replace('I ', '')}"
        
        personality_statements.append(statement)
    
    # Create coherent personality description
    description = " ".join(personality_statements)
    return description

# Initialize scorer
mbti_scorer = FixedMBTIScorer()

# Valid MBTI types for validation
VALID_MBTI_TYPES = [
    "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
]

# ========== API ENDPOINTS ==========

@router.get("/questions")
def get_mbti_questions():
    """Get randomized MBTI questions"""
    axes = ["IE", "NS", "TF", "JP"]
    questions_per_axis = 5
    selected_questions = []

    for axis in axes:
        docs = list(db.collection("mbti_questions").where("dimension", "==", axis).stream())
        axis_questions = [{**d.to_dict(), "id": d.id} for d in docs]
        
        if len(axis_questions) < questions_per_axis:
            raise HTTPException(status_code=400, detail=f"Not enough questions for axis {axis}")
        
        selected_questions.extend(random.sample(axis_questions, questions_per_axis))

    random.shuffle(selected_questions)
    return {"questions": selected_questions}

class MBTISubmitRequest(BaseModel):
    answers: dict

@router.post("/submit")
def submit_mbti(candidate_id: str, payload: MBTISubmitRequest):
    """
    FIXED: Process MBTI responses with proper ML model input and traditional scoring
    
    Priority: ML Model (your project requirement) with Traditional as backup
    """
    answers = payload.answers

    try:
        # STEP 1: Traditional MBTI scoring (reliable backup)
        traditional_mbti, dimension_scores, dimension_details = mbti_scorer.calculate_traditional_mbti(answers)
        
        # STEP 2: Create better input format for your ML model
        personality_description = create_personality_description_for_ml(answers)
        
        # STEP 3: Get ML model prediction (YOUR PRIMARY METHOD)
        try:
            ml_mbti_type = load_model.predict_mbti(personality_description)
            
            # Validate ML result
            if ml_mbti_type not in VALID_MBTI_TYPES:
                print(f"Warning: ML model returned invalid type: {ml_mbti_type}")
                ml_mbti_type = "INVALID"
        except Exception as e:
            print(f"ML model error: {e}")
            ml_mbti_type = "ERROR"
        
        # STEP 4: Choose final result (ML model priority, traditional as fallback)
        if ml_mbti_type in VALID_MBTI_TYPES:
            final_mbti_type = ml_mbti_type  # Use ML model result
            confidence = "HIGH"
        else:
            final_mbti_type = traditional_mbti  # Use traditional as fallback
            confidence = "MEDIUM"
        
        # STEP 5: Save comprehensive results
        result_data = {
            "candidate_id": candidate_id,
            "answers": answers,
            "final_mbti_type": final_mbti_type,
            "ml_mbti": ml_mbti_type,
            "traditional_mbti": traditional_mbti,
            "dimension_scores": dimension_scores,
            "dimension_details": dimension_details,
            "personality_input": personality_description,
            "confidence": confidence,
            "type_agreement": ml_mbti_type == traditional_mbti,
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.collection("mbti_results").document(candidate_id).set(result_data)

        return {
            "success": True,
            "candidate_id": candidate_id,
            "mbti_type": final_mbti_type,
            "confidence": confidence,
            "ml_result": ml_mbti_type,
            "traditional_result": traditional_mbti,
            "dimension_scores": dimension_scores
        }
        
    except Exception as e:
        print(f"Error in submit_mbti: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.get("/result/{candidate_id}")
def get_mbti_result(candidate_id: str):
    """Get MBTI results for a candidate"""
    doc = db.collection("mbti_results").document(candidate_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Result not found")
    
    result = doc.to_dict()
    return {
        "candidate_id": candidate_id,
        "mbti_type": result.get("final_mbti_type"),
        "confidence": result.get("confidence", "MEDIUM"),
        "ml_result": result.get("ml_mbti"),
        "traditional_result": result.get("traditional_mbti"),
        "dimension_scores": result.get("dimension_scores"),
        "created_at": result.get("created_at")
    }

# Email functionality (keep existing)
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

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
    mbti_type = res_doc.to_dict().get("final_mbti_type")

    cand_doc = db.collection("candidates").document(candidate_id).get()
    if not cand_doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")
    email = cand_doc.to_dict().get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email on file")

    background_tasks.add_task(send_email, email, mbti_type)
    return {"message": "Email queued"}

# ========== TESTING/DEBUG ENDPOINT ==========
@router.post("/test-ml-input")
def test_ml_input(payload: MBTISubmitRequest):
    """Test endpoint to debug ML model input format"""
    answers = payload.answers
    
    # Create personality description
    personality_description = create_personality_description_for_ml(answers)
    
    # Test with your ML model
    try:
        ml_result = load_model.predict_mbti(personality_description)
    except Exception as e:
        ml_result = f"ERROR: {str(e)}"
    
    return {
        "personality_description": personality_description,
        "ml_result": ml_result,
        "is_valid_mbti": ml_result in VALID_MBTI_TYPES
    }


# from fastapi import APIRouter, HTTPException, BackgroundTasks
# from utils.firebase_configuration import db
# from datetime import datetime
# import random, os, smtplib
# from email.mime.text import MIMEText
# from pydantic import BaseModel

# import importlib.util
# import sys
# import os
# # Add the parent folder (RecruitMind) to Python path
# sys.path.append(r"S:\SLIITA\Year 3 UOB\RecruitMind")


# model_path = os.path.join(r"S:\SLIITA\Year 3 UOB\RecruitMind", "personality-questionnaire", "load-model.py")
# spec = importlib.util.spec_from_file_location("load_model", model_path)
# load_model = importlib.util.module_from_spec(spec)
# sys.modules["load_model"] = load_model
# spec.loader.exec_module(load_model)

# router = APIRouter(prefix="/mbti", tags=["MBTI"])

# # ========== GET QUESTIONS ==========
# @router.get("/questions")
# def get_mbti_questions():
#     # axes
#     axes = ["IE", "NS", "TF", "JP"]
#     questions_per_axis = 5
#     selected_questions = []

#     # fetch and sample per axis
#     for axis in axes:
#         docs = list(db.collection("mbti_questions").where("dimension", "==", axis).stream())
#         axis_questions = [{**d.to_dict(), "id": d.id} for d in docs]
        
#         if len(axis_questions) < questions_per_axis:
#             raise HTTPException(status_code=400, detail=f"Not enough questions for axis {axis}")
        
#         selected_questions.extend(random.sample(axis_questions, questions_per_axis))

#     # shuffle final 20 questions
#     random.shuffle(selected_questions)
#     return {"questions": selected_questions}


# # ========== SUBMIT ANSWERS ==========
# class MBTISubmitRequest(BaseModel):
#     answers: dict

# @router.post("/submit")
# def submit_mbti(candidate_id: str, payload: MBTISubmitRequest):
#     answers = payload.answers

#     # map numeric answers to text
#     likert_map = {
#         "1": "Strongly Disagree",
#         "2": "Disagree",
#         "3": "Neutral",
#         "4": "Agree",
#         "5": "Strongly Agree"
#     }

#     # map each answer to the corresponding question text
#     question_texts = []
#     for qid, val in answers.items():
#         doc = db.collection("mbti_questions").document(qid).get()
#         if not doc.exists:
#             continue
#         q_text = doc.to_dict()["question"]
#         # convert numeric answer to text
#         answer_text = likert_map.get(val, val)
#         # append the answer as text for context
#         question_texts.append(f"{q_text} Answer: {answer_text}")

#     # join all questions+answers
#     joined_text = " ".join(question_texts)

#     # predict using your existing model
#     mbti_type = load_model.predict_mbti(joined_text)

#     # save results
#     db.collection("mbti_results").document(candidate_id).set({
#         "candidate_id": candidate_id,
#         "answers": answers,
#         "mbti_type": mbti_type,
#         "created_at": datetime.utcnow().isoformat()
#     })

#     return {"candidate_id": candidate_id, "mbti_type": mbti_type}


# # ========== GET RESULT ==========
# @router.get("/result/{candidate_id}")
# def get_mbti_result(candidate_id: str):
#     doc = db.collection("mbti_results").document(candidate_id).get()
#     if not doc.exists:
#         raise HTTPException(status_code=404, detail="Result not found")
#     return doc.to_dict()

# # ========== EMAIL RESULTS ==========
# SMTP_USER = os.getenv("SMTP_USER")
# SMTP_PASS = os.getenv("SMTP_PASS")
# SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
# SMTP_PORT  = int(os.getenv("SMTP_PORT", "587"))

# def send_email(to_email: str, mbti_type: str):
#     msg = MIMEText(f"Thanks for completing the test.\n\nYour MBTI type is: {mbti_type}")
#     msg["Subject"] = "Your MBTI Test Results"
#     msg["From"] = SMTP_USER
#     msg["To"] = to_email

#     with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as s:
#         s.starttls()
#         s.login(SMTP_USER, SMTP_PASS)
#         s.send_message(msg)

# @router.post("/email-results/{candidate_id}")
# def email_results(candidate_id: str, background_tasks: BackgroundTasks):
#     res_doc = db.collection("mbti_results").document(candidate_id).get()
#     if not res_doc.exists:
#         raise HTTPException(status_code=404, detail="Results not found")
#     mbti_type = res_doc.to_dict().get("mbti_type")

#     cand_doc = db.collection("candidates").document(candidate_id).get()
#     if not cand_doc.exists:
#         raise HTTPException(status_code=404, detail="Candidate not found")
#     email = cand_doc.to_dict().get("email")
#     if not email:
#         raise HTTPException(status_code=400, detail="No email on file")

#     background_tasks.add_task(send_email, email, mbti_type)
#     return {"message": "Email queued"}



