from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_admin import firestore

router = APIRouter(prefix="/admin/candidates", tags=["Admin"])

class CandidateIn(BaseModel):
    name: str
    email: EmailStr

@router.post("/")
async def add_candidate(candidate: CandidateIn):
    try:
        db = firestore.client()
        # Use email as candidateId for document ID (or generate a unique candidateId if preferred)
        candidate_id = candidate.email  # You can use a UUID or another unique field if needed
        doc_ref = db.collection("candidates").document(candidate_id)
        doc_ref.set({
            "name": candidate.name,
            "email": candidate.email,
            "active": True,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "Candidate added successfully", "id": candidate_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding candidate: {str(e)}")

@router.get("/")
async def list_candidates():
    try:
        db = firestore.client()
        candidates_ref = db.collection("candidates").order_by("createdAt", direction=firestore.Query.DESCENDING)
        docs = candidates_ref.stream()
        candidates = []
        for doc in docs:
            data = doc.to_dict()
            candidates.append({
                "id": doc.id,
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "createdAt": data.get("createdAt").isoformat() if data.get("createdAt") else None
            })
        return candidates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching candidates: {e}")
