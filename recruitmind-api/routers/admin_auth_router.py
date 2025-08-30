from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
from utils.security import gen_otp, create_jwt
from schemas.otp_schema import RequestOtpIn, VerifyOtpIn, TokenOut
from utils.email import send_otp_email
from utils.firebase_configuration import db
import bcrypt

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])

@router.post("/request-otp")
def request_otp(data: RequestOtpIn):
    admin_ref = db.collection("admins").where("email", "==", data.email).get()
    if not admin_ref:
        raise HTTPException(status_code=404, detail="Admin not registered")

    otp = gen_otp()
    code_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()

    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(minutes=5)

    db.collection("otps").add({
        "email": data.email,
        "code_hash": code_hash,
        "expires_at": expires_at,
        "consumed": False,
        "created_at": created_at
    })

    send_otp_email(data.email, otp)
    return {"message": f"OTP sent to {data.email}"}

@router.post("/verify-otp", response_model=TokenOut)
def verify_otp(data: VerifyOtpIn):
    otp_docs = db.collection("otps") \
                 .where("email", "==", data.email) \
                 .order_by("created_at", direction="DESCENDING") \
                 .limit(1).get()

    if not otp_docs:
        raise HTTPException(status_code=400, detail="No OTP found for this email")

    otp_doc = otp_docs[0]
    otp_entry = otp_doc.to_dict()

    if otp_entry.get("consumed", False):
        raise HTTPException(status_code=400, detail="OTP already used")

    expires_at = otp_entry.get("expires_at")
    if hasattr(expires_at, "to_datetime"):
        expires_at_dt = expires_at.to_datetime().replace(tzinfo=timezone.utc)
    elif isinstance(expires_at, datetime):
        expires_at_dt = expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)
    else:
        expires_at_dt = datetime.fromisoformat(str(expires_at)).replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at_dt:
        raise HTTPException(status_code=400, detail="OTP expired")

    if not bcrypt.checkpw(data.code.encode(), otp_entry["code_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid OTP")

    db.collection("otps").document(otp_doc.id).update({"consumed": True})

    token = create_jwt(sub=data.email, role="admin")
    return TokenOut(access_token=token, token_type="bearer")