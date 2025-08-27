from utils.firebase_configuration import db

# Improved MBTI questions with better balance and reduced bias
IMPROVED_MBTI_QUESTIONS = {
    "IE": [
        # Extroversion-leaning questions
        {"question": "I find it easy to introduce myself to new people in unfamiliar settings.", "weight": 2},
        {"question": "I am comfortable sharing my ideas with a group, even if they are not fully developed.", "weight": 2},
        {"question": "I enjoy participating in group activities and discussions.", "weight": 2},
        {"question": "I often take the initiative to start conversations in social situations.", "weight": 1},
        {"question": "I prefer working with others rather than working alone.", "weight": 1},
        {"question": "I feel energized after interacting with several people in a day.", "weight": 2},
        # Introversion-leaning questions
        {"question": "I prefer to think through my ideas before sharing them with others.", "weight": -2},
        {"question": "I feel the need to recharge after social events.", "weight": -2},
        {"question": "I am more comfortable observing than participating in group discussions.", "weight": -2},
        {"question": "I express myself better in writing than in speech.", "weight": -1},
        {"question": "I seek out quiet environments to focus on my work.", "weight": -1},
        {"question": "I take time to reflect before responding to unexpected questions.", "weight": -1},
    ],
    "NS": [
        # Intuition-leaning questions
        {"question": "I enjoy exploring new ideas and possibilities.", "weight": 2},
        {"question": "I am interested in projects with uncertain outcomes.", "weight": 2},
        {"question": "I like imagining alternative ways to solve problems.", "weight": 2},
        {"question": "I often ask 'what if' when considering options.", "weight": 2},
        {"question": "I notice patterns and connections that others might miss.", "weight": 1},
        {"question": "I am energized by discussions about abstract concepts.", "weight": 1},
        # Sensing-leaning questions
        {"question": "I prefer clear and detailed instructions for tasks.", "weight": -2},
        {"question": "I rely on my previous experiences to make decisions.", "weight": -2},
        {"question": "I prefer working with concrete results rather than theories.", "weight": -2},
        {"question": "I feel uncomfortable when expectations are vague.", "weight": -2},
        {"question": "I quickly notice when something is out of place.", "weight": -1},
        {"question": "I trust information that I can observe directly.", "weight": -1},
    ],
    "TF": [
        # Feeling-leaning questions
        {"question": "I consider how my words might affect others emotionally.", "weight": 2},
        {"question": "I am willing to adjust my preferences to maintain group harmony.", "weight": 2},
        {"question": "I feel responsible for the well-being of people I work with.", "weight": 2},
        {"question": "I offer support when I notice someone having difficulty.", "weight": 1},
        {"question": "I value personal recognition from colleagues.", "weight": 1},
        {"question": "I am aware of changes in the mood of a group.", "weight": 1},
        # Thinking-leaning questions
        {"question": "I am comfortable making decisions that may not be popular if they are logical.", "weight": -2},
        {"question": "I prefer to address problems directly rather than avoid conflict.", "weight": -2},
        {"question": "I focus on fairness in processes more than emotional impact.", "weight": -2},
        {"question": "I challenge ideas that lack evidence, even if it creates tension.", "weight": -1},
        {"question": "I believe consistency is important in decision-making.", "weight": -1},
        {"question": "I am more interested in outcomes than in how people feel about them.", "weight": -1},
    ],
    "JP": [
        # Judging-leaning questions
        {"question": "I make detailed plans for tasks, even simple ones.", "weight": -2},
        {"question": "I feel uneasy if I have not finished my work ahead of schedule.", "weight": -2},
        {"question": "I am more productive when my day is planned and predictable.", "weight": -2},
        {"question": "I prefer meetings with a set agenda.", "weight": -1},
        {"question": "I finish tasks before starting new ones, even if deadlines are flexible.", "weight": -1},
        {"question": "I keep track of my progress using lists or similar systems.", "weight": -1},
        # Perceiving-leaning questions
        {"question": "I am energized by changes and unexpected challenges.", "weight": 2},
        {"question": "I prefer to keep my schedule open for spontaneous opportunities.", "weight": 2},
        {"question": "I am comfortable handling multiple tasks without a fixed order.", "weight": 1},
        {"question": "I enjoy trying different approaches before deciding on a solution.", "weight": 1},
        {"question": "I am likely to change my plans if something more interesting comes up.", "weight": 2},
        {"question": "I do well in environments where priorities shift often.", "weight": 2},
    ]
}

def validate_question_quality():
    """Validate questions for bias and balance"""
    validation_report = {
        "dimension_balance": {},
        "bias_check": [],
        "recommendations": []
    }
    
    for dimension, questions in IMPROVED_MBTI_QUESTIONS.items():
        positive_count = len([q for q in questions if q["weight"] > 0])
        negative_count = len([q for q in questions if q["weight"] < 0])
        
        validation_report["dimension_balance"][dimension] = {
            "total": len(questions),
            "positive_weight": positive_count,
            "negative_weight": negative_count,
            "balance_ratio": positive_count / negative_count if negative_count > 0 else "inf"
        }
        
        # Check for leading questions
        for q in questions:
            question_text = q["question"].lower()
            
            # Flag potentially biased language
            bias_words = ["always", "never", "all", "none", "everyone", "no one"]
            if any(word in question_text for word in bias_words):
                validation_report["bias_check"].append({
                    "dimension": dimension,
                    "question": q["question"],
                    "issue": "Contains absolute language that may bias responses"
                })
            
            # Flag double-barreled questions
            if " and " in question_text and " or " not in question_text:
                validation_report["bias_check"].append({
                    "dimension": dimension,
                    "question": q["question"],
                    "issue": "May be double-barreled (asking about multiple concepts)"
                })
    
    # Generate recommendations
    for dim, balance in validation_report["dimension_balance"].items():
        if balance["balance_ratio"] < 0.8 or balance["balance_ratio"] > 1.2:
            validation_report["recommendations"].append(
                f"Dimension {dim} is unbalanced ({balance['positive_weight']} positive vs {balance['negative_weight']} negative)"
            )
    
    return validation_report

def seed_improved_mbti():
    """Seed database with improved questions"""
    options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    question_id = 1
    
    for dimension, questions in IMPROVED_MBTI_QUESTIONS.items():
        for q_data in questions:
            doc = {
                "id": f"q{question_id}",
                "question": q_data["question"],
                "dimension": dimension,
                "weight": q_data["weight"],  # Store weight for validation
                "options": options,
                "version": "improved_v1"  # Track question version
            }
            db.collection("mbti_questions").document(doc["id"]).set(doc)
            question_id += 1
    
    print("✅ Seeded improved MBTI questions")
    
    # Run validation
    validation = validate_question_quality()
    print("\n📊 Question Quality Validation:")
    print(f"Balance check: {validation['dimension_balance']}")
    if validation['bias_check']:
        print(f"⚠️  Potential bias issues found: {len(validation['bias_check'])}")
    if validation['recommendations']:
        print(f"📋 Recommendations: {validation['recommendations']}")

if __name__ == "__main__":
    seed_improved_mbti()
    
# Usage: 
# python improved_seed_questions.py