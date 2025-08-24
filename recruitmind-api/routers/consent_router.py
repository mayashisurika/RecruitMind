# recruitmind-api/routers/consent_router.py
from fastapi import APIRouter, HTTPException
from utils.firebase_configuration import db

router = APIRouter(tags=["Candidate"])

@router.post("/candidate/consent")
def give_consent(candidate_id: str, consent: bool):
    if not consent:
        raise HTTPException(status_code=400, detail="Consent required")
    cand_ref = db.collection("candidates").document(candidate_id)
    if not cand_ref.get().exists:
        cand_ref.set({"email": None})  # ensure doc exists
    cand_ref.update({"consent_given": True})
    return {"success": True}
