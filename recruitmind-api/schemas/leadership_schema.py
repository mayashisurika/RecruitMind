from pydantic import BaseModel
from typing import List, Optional

class LeadershipAnswer(BaseModel):
    question_id: str
    style: str

class LeadershipResult(BaseModel):
    dominant_style: str
    blended: Optional[str]
    description: str
