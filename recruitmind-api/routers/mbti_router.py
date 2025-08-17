from fastapi import APIRouter, HTTPException, Depends
from schemas.mbti_schema import Answers, MBTIResponse
from models.mbti_model import MBTIModel
from utils.auth_dependencies import get_current_user
from utils.firebase_configuration import db  # Firestore client

router = APIRouter(prefix="/api/v1/mbti", tags=["MBTI"])

mbti_model = MBTIModel()

@router.post("/predict", response_model=MBTIResponse)
async def predict_mbti(
    answers: Answers,
    current_user: dict = Depends(get_current_user)  # Require authenticated user
):
    try:
        # Combine all answers into a single string for the model
        text_input = " ".join(answers.answers)
        mbti_type = mbti_model.predict(text_input)

        # Optionally save MBTI result to Firestore under the user
        db.collection("mbti_results").document(current_user["uid"]).set({
            "mbti_type": mbti_type,
            "answers": answers.answers
        })

        return MBTIResponse(mbti_type=mbti_type)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
