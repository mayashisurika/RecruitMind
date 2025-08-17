from fastapi import APIRouter, HTTPException, Request
from utils.firebase_configuration import verify_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
async def login(request: Request):
    data = await request.json()
    id_token = data.get("idToken")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing idToken")
    user = verify_token(id_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": user}

@router.post("/logout")
async def logout():
    # For stateless APIs, logout is handled on the frontend
    return {"message": "Logged out (frontend should clear token)"}
