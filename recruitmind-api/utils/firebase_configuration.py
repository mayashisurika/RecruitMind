# recruitmind-api/utils/firebase_configuration.py
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("utils/firebase_config.json")
default_app = firebase_admin.initialize_app(cred)

db = firestore.client()  # Firestore client

def verify_token(id_token: str):
    """Verify Firebase JWT token sent from frontend"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("Token verification failed:", e)
        return None
