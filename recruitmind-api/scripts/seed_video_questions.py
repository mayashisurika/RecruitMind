from utils.firebase_configuration import db
from datetime import datetime

def seed_video_questions():
    """
    Seed video interview questions to Firestore
    """
    questions = [
        {
            "id": "v1",
            "text": "Tell us about a challenge you faced at work and how you handled it.",
            "category": "problem_solving",
            "difficulty": "medium",
            "expected_duration": 120  # 2 minutes
        },
        {
            "id": "v2", 
            "text": "Describe a time when you had to work with a difficult team member. How did you handle the situation?",
            "category": "teamwork",
            "difficulty": "medium",
            "expected_duration": 120  # 2 minutes
        },
        {
            "id": "v3",
            "text": "What motivates you in your work, and how do you stay motivated during challenging projects?",
            "category": "motivation",
            "difficulty": "easy",
            "expected_duration": 90   # 1.5 minutes
        },
        {
            "id": "v4",
            "text": "Tell us about a time you had to learn a new skill quickly. How did you approach it?",
            "category": "adaptability",
            "difficulty": "medium", 
            "expected_duration": 120  # 2 minutes
        },
        {
            "id": "v5",
            "text": "Describe a situation where you had to make a difficult decision with limited information.",
            "category": "decision_making",
            "difficulty": "hard",
            "expected_duration": 150  # 2.5 minutes
        },
        {
            "id": "v6",
            "text": "How do you prioritize tasks when you have multiple deadlines approaching?",
            "category": "time_management", 
            "difficulty": "easy",
            "expected_duration": 90   # 1.5 minutes
        },
        {
            "id": "v7",
            "text": "Tell us about a time when you received constructive criticism. How did you respond?",
            "category": "growth_mindset",
            "difficulty": "medium",
            "expected_duration": 120  # 2 minutes
        },
        {
            "id": "v8",
            "text": "Describe a project you're particularly proud of and your role in its success.",
            "category": "achievements",
            "difficulty": "easy",
            "expected_duration": 120  # 2 minutes
        }
    ]
    
    # Add metadata
    for question in questions:
        question.update({
            "created_at": datetime.now(),
            "is_active": True,
            "version": "1.0"
        })
    
    # Clear existing questions (optional)
    existing_docs = db.collection("video_questions").stream()
    for doc in existing_docs:
        doc.reference.delete()
    
    # Add new questions
    for question in questions:
        # Use the question ID as document ID for consistency
        db.collection("video_questions").document(question["id"]).set(question)
        print(f"Added question: {question['id']}")
    
    print(f"Successfully seeded {len(questions)} video questions!")

if __name__ == "__main__":
    seed_video_questions()