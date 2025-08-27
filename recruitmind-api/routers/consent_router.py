# recruitmind-api/routers/consent_router.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi import Body
from utils.firebase_configuration import db


router = APIRouter(tags=["Candidate"])

class ConsentRequest(BaseModel):
    candidate_id: str
    consent: bool


@router.post("/candidate/consent")
def give_consent(request: ConsentRequest = Body(...)):
    if not request.consent:
        raise HTTPException(status_code=400, detail="Consent required")
    cand_ref = db.collection("candidates").document(request.candidate_id)
    if not cand_ref.get().exists:
        cand_ref.set({"email": None})  # ensure doc exists
    cand_ref.update({"consent_given": True})
    return {"success": True}
