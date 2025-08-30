from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_admin import firestore

router = APIRouter(prefix="/admin/admins", tags=["Admin"])

class AdminIn(BaseModel):
    name: str
    email: EmailStr

@router.post("/")
async def add_admin(admin: AdminIn):
    try:
        db = firestore.client()
        doc_ref = db.collection("admins").document()  # auto-ID
        doc_ref.set({
            "name": admin.name,
            "email": admin.email,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "Admin added successfully", "id": doc_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding admin: {str(e)}")

@router.get("/")
async def list_admins():
    try:
        db = firestore.client()
        admins_ref = db.collection("admins").order_by("createdAt", direction=firestore.Query.DESCENDING)
        docs = admins_ref.stream()
        admins = []
        for doc in docs:
            data = doc.to_dict()
            created_at = data.get("createdAt")
            if hasattr(created_at, "isoformat"):
                created_at_str = created_at.isoformat()
            elif isinstance(created_at, str):
                created_at_str = created_at
            else:
                created_at_str = None
            admins.append({
                "id": doc.id,
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "createdAt": created_at_str
            })
        return admins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {e}")
