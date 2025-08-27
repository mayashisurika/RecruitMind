# FastAPI router for leadership assessment endpoints
from fastapi import APIRouter, HTTPException
from typing import List, Dict
from utils.firebase_configuration import db
from datetime import datetime
import statistics
from models.leadership_model import LeadershipAnswer


# Create API router for leadership endpoints
router = APIRouter(prefix="/leadership", tags=["Leadership"])

## Effectiveness matrix: how suitable each leadership style is for different contexts
EFFECTIVENESS_MATRIX = {
    "Crisis Management": {"Autocratic": 0.9, "Democratic": 0.4, "Laissez-Faire": 0.2},
    "Innovation": {"Autocratic": 0.3, "Democratic": 0.8, "Laissez-Faire": 0.7},
    "Team Development": {"Autocratic": 0.2, "Democratic": 0.9, "Laissez-Faire": 0.4},
    "Routine Operations": {"Autocratic": 0.7, "Democratic": 0.8, "Laissez-Faire": 0.5},
    "Problem Solving": {"Autocratic": 0.6, "Democratic": 0.9, "Laissez-Faire": 0.4},
    "Performance Management": {"Autocratic": 0.8, "Democratic": 0.7, "Laissez-Faire": 0.3},
    "Resource Management": {"Autocratic": 0.7, "Democratic": 0.8, "Laissez-Faire": 0.3}
}

## Maps question IDs to their context for scoring
QUESTION_CONTEXTS = {
    "lq1": "Crisis Management",      # Behind schedule
    "lq2": "Performance Management", # Poor performance
    "lq3": "Team Development",       # Conflict resolution
    "lq4": "Routine Operations",     # Project assignment
    "lq5": "Team Development",       # Motivation
    "lq6": "Crisis Management",      # Quick decisions
    "lq7": "Innovation",             # New process
    "lq8": "Team Development",       # Idea challenges
    "lq9": "Performance Management", # Quality issues
    "lq10": "Performance Management", # Reviews
    "lq11": "Problem Solving",       # Sudden problems
    "lq12": "Innovation",            # Brainstorming
    "lq13": "Team Development",      # Group dynamics
    "lq14": "Team Development",      # Skill development
    "lq15": "Resource Management"    # Budget constraints
}

def calculate_leadership_scores(answers: List[Dict]) -> Dict:
    """
    Calculate leadership assessment scores based on:
    - Raw style selection counts
    - Contextual effectiveness (how appropriate the chosen style is for the situation)
    - Flexibility (variance in style choices)
    Returns a breakdown of scores and metrics.
    """
    
    # Initialize scoring
    raw_scores = {"Autocratic": 0, "Democratic": 0, "Laissez-Faire": 0}
    weighted_effectiveness = 0
    context_breakdown = {}
    total_questions = len(answers)
    
    if total_questions == 0:
        raise ValueError("No answers provided")
    
    # Process each answer
    for answer in answers:
        question_id = answer.get("questionId")
        selected_style = answer.get("style")
        
        if not question_id or not selected_style:
            continue
            
        # Count raw selections
        if selected_style in raw_scores:
            raw_scores[selected_style] += 1
        
        # Calculate contextual effectiveness
        context = QUESTION_CONTEXTS.get(question_id, "Routine Operations")
        effectiveness = EFFECTIVENESS_MATRIX.get(context, {}).get(selected_style, 0.5)
        weighted_effectiveness += effectiveness
        
        # Track by context
        if context not in context_breakdown:
            context_breakdown[context] = {"choices": [], "average_effectiveness": 0}
        
        context_breakdown[context]["choices"].append({
            "style": selected_style,
            "effectiveness": effectiveness
        })
    
    # Calculate context averages
    for context in context_breakdown:
        choices = context_breakdown[context]["choices"]
        avg_eff = sum(c["effectiveness"] for c in choices) / len(choices)
        context_breakdown[context]["average_effectiveness"] = round(avg_eff, 2)
    
    # Calculate percentages
    percentage_scores = {}
    for style in raw_scores:
        percentage_scores[style] = round((raw_scores[style] / total_questions) * 100, 1)
    
    # Calculate metrics
    overall_effectiveness = round((weighted_effectiveness / total_questions) * 100, 1)
    
    # Calculate flexibility (balanced = more flexible)
    style_variance = statistics.variance(percentage_scores.values()) if len(percentage_scores.values()) > 1 else 0
    flexibility_score = max(0, min(100, round(100 - (style_variance / 10), 1)))
    
    # Determine primary style
    primary_style = max(percentage_scores, key=percentage_scores.get)
    
    return {
        "raw_scores": raw_scores,
        "percentage_scores": percentage_scores,
        "primary_style": primary_style,
        "overall_effectiveness": overall_effectiveness,
        "flexibility_score": flexibility_score,
        "context_breakdown": context_breakdown,
        "total_questions_answered": total_questions
    }

def generate_leadership_feedback(scores: Dict) -> Dict:
    """
    Generate feedback text for the candidate based on their scores:
    - Primary style description
    - Effectiveness feedback
    - Flexibility feedback
    """
    
    primary_style = scores["primary_style"]
    effectiveness = scores["overall_effectiveness"]
    flexibility = scores["flexibility_score"]
    
    # Style descriptions
    descriptions = {
        "Autocratic": "You tend to make decisions independently and maintain control over processes.",
        "Democratic": "You involve team members in decision-making and value collaborative problem-solving.",
        "Laissez-Faire": "You provide team members with autonomy and trust them to self-direct their work."
    }
    
    # Generate feedback based on scores
    if effectiveness >= 80:
        effectiveness_feedback = "Strong situational leadership awareness"
    elif effectiveness >= 70:
        effectiveness_feedback = "Good leadership effectiveness with room for improvement"
    else:
        effectiveness_feedback = "Consider developing situational leadership skills"
    
    if flexibility >= 70:
        flexibility_feedback = "High adaptability in leadership approach"
    else:
        flexibility_feedback = "Consider expanding leadership style range"
    
    return {
        "primary_style_description": descriptions.get(primary_style, ""),
        "effectiveness_feedback": effectiveness_feedback,
        "flexibility_feedback": flexibility_feedback
    }




@router.get("/questions")
def get_leadership_questions():
    """
    GET endpoint: Returns all leadership assessment questions from Firestore.
    Used by frontend to display questions to candidates.
    """
    try:
        docs = db.collection("leadership_questions").stream()
        questions = []
        
        for doc in docs:
            question_data = doc.to_dict()
            question_data["id"] = doc.id
            questions.append(question_data)

        if not questions:
            raise HTTPException(status_code=404, detail="No questions found")

        questions.sort(key=lambda x: x.get("id", ""))
        return questions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {str(e)}")

@router.post("/result")
def submit_leadership_assessment(answers: List[LeadershipAnswer], candidateId: str):
    """
    POST endpoint: Receives candidate answers, calculates scores and feedback, and saves result to Firestore.
    Returns a success message.
    """
    
    if not candidateId:
        raise HTTPException(status_code=400, detail="Candidate ID required")
    
    if not answers or len(answers) < 8:
        raise HTTPException(status_code=400, detail="At least 8 questions required")

    try:
        # Convert to dict format
        answer_data = [{"questionId": a.questionId, "style": a.style, "option": a.option} for a in answers]
        
        # Calculate scores
        scores = calculate_leadership_scores(answer_data)
        feedback = generate_leadership_feedback(scores)
        
        # Save to database
        result = {
            "candidate_id": candidateId,
            "timestamp": datetime.utcnow().isoformat(),
            "answers": [a.dict() for a in answers],
            "scores": scores,
            "feedback": feedback
        }
        
        db.collection("leadership_results").document(candidateId).set(result)
        
        return {"message": "Leadership assessment saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing assessment: {str(e)}")

@router.get("/result/{candidate_id}")
def get_leadership_result(candidate_id: str):
    """
    GET endpoint: Returns a candidate's leadership assessment result (for admin view).
    """
    try:
        doc = db.collection("leadership_results").document(candidate_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="No results found")
        
        return doc.to_dict()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving results: {str(e)}")

@router.get("/analytics")
def get_analytics():
    """
    GET endpoint: Returns analytics about all leadership assessments (distribution, average effectiveness).
    """
    try:
        docs = list(db.collection("leadership_results").stream())
        
        if not docs:
            return {"message": "No data available"}
        
        total = len(docs)
        styles = {"Autocratic": 0, "Democratic": 0, "Laissez-Faire": 0}
        effectiveness_scores = []
        
        for doc in docs:
            data = doc.to_dict()
            scores = data.get("scores", {})
            
            primary = scores.get("primary_style")
            if primary in styles:
                styles[primary] += 1
            
            eff = scores.get("overall_effectiveness", 0)
            if eff > 0:
                effectiveness_scores.append(eff)
        
        avg_effectiveness = round(statistics.mean(effectiveness_scores), 1) if effectiveness_scores else 0
        
        return {
            "total_assessments": total,
            "style_distribution": styles,
            "average_effectiveness": avg_effectiveness
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")