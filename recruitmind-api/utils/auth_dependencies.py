from fastapi import Depends, Header, HTTPException
from utils.firebase_configuration import verify_token

def get_current_user(authorization: str = Header(...)):
    """
    Verify Firebase ID token from the Authorization header.
    Expect header format: "Authorization: Bearer <idToken>"
    """
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")

    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
