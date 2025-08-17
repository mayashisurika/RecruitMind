from pydantic import BaseModel

class Answers(BaseModel):
    text: str

class MBTIResponse(BaseModel):
    mbti_type: str