import os, jwt, bcrypt, secrets
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "60"))

def hash_code(code: str) -> str:
    """Secure hash for OTP using bcrypt"""
    # Generate salt and hash the OTP
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(code.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_otp_code(plain_otp: str, hashed_otp: str) -> bool:
    """Securely verify OTP against hash (timing-attack resistant)"""
    try:
        return bcrypt.checkpw(plain_otp.encode('utf-8'), hashed_otp.encode('utf-8'))
    except (ValueError, TypeError):
        return False

def gen_otp(n=6) -> str:
    """Generate numeric OTP"""
    return "".join(secrets.choice("0123456789") for _ in range(n))

def create_jwt(sub: str, role: str = "candidate"):
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MIN)
    payload = {"sub": sub, "role": role, "exp": exp}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

# Pydantic models
class RequestOtpIn(BaseModel):
    email: EmailStr

class VerifyOtpIn(BaseModel):
    email: EmailStr
    otp: str   # must match frontend key

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"