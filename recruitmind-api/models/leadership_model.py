from pydantic import BaseModel
from typing import List, Optional

class LeadershipQuestion(BaseModel):
    id: str
    text: str
    options: List[str]
    styles: List[str]
    section: str

# Model for submitted leadership answers
class LeadershipAnswer(BaseModel):
    questionId: str   # Question ID (e.g., lq1)
    style: str        # Selected leadership style (Autocratic, Democratic, Laissez-Faire)
    option: str       # The option text chosen by the candidate


# Response after calculating leadership style
class LeadershipResult(BaseModel):
    dominant_style: str
    blended: Optional[str]
    description: str