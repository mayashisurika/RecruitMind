# recruitmind-api/routers/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.firebase_configuration import auth, db, verify_token

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

class UserSignUp(BaseModel):
    email: str
    password: str
    name: str

@router.post("/signup")
async def signup(user: UserSignUp):
    try:
        # Create user in Firebase Authentication
        firebase_user = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.name
        )

        # Save additional info in Firestore
        db.collection("users").document(firebase_user.uid).set({
            "name": user.name,
            "email": user.email
        })

        return {"message": "User created successfully", "uid": firebase_user.uid}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
