# enhanced_leadership_seed.py
from utils.firebase_configuration import db

# Enhanced Leadership questions with better context mapping and options
LEADERSHIP_QUESTIONS = [
    {
        "id": "lq1",
        "text": "Your team is behind schedule on a critical project with a firm deadline. What do you do?",
        "options": [
            "Take immediate control, reassign tasks, and set new deadlines yourself",
            "Call an urgent team meeting to discuss solutions and redistribute work collaboratively",
            "Trust the team to self-organize and find their own way to meet the deadline"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Crisis Management",
        "situation_type": "Time_Critical"
    },
    {
        "id": "lq2",
        "text": "A team member consistently delivers work below expected quality standards. How do you address this?",
        "options": [
            "Provide clear, specific instructions and implement close monitoring until improvement",
            "Have a one-on-one discussion to understand issues and develop an improvement plan together",
            "Give them space to identify their own quality issues and self-correct"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Performance Management",
        "situation_type": "Individual_Performance"
    },
    {
        "id": "lq3",
        "text": "Two key team members are in conflict, affecting team morale and productivity. What's your approach?",
        "options": [
            "Make a decisive ruling on the dispute and set clear behavioral expectations",
            "Facilitate a mediated discussion to help them understand each other and find common ground",
            "Allow them time and space to resolve their differences naturally"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Team Development",
        "situation_type": "Conflict_Resolution"
    },
    {
        "id": "lq4",
        "text": "You need to assign roles for a new strategic initiative with unclear requirements. How do you proceed?",
        "options": [
            "Analyze the project needs and assign roles based on your assessment of team strengths",
            "Present the project to the team and collaboratively determine who fits where best",
            "Outline the project and let team members volunteer for roles that interest them"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Routine Operations",
        "situation_type": "Task_Assignment"
    },
    {
        "id": "lq5",
        "text": "Your team's motivation seems low, and engagement in meetings has dropped. What's your strategy?",
        "options": [
            "Implement new performance metrics and establish clear consequences for low engagement",
            "Hold team discussions to understand concerns and work together on solutions",
            "Give the team more autonomy and trust they'll rediscover their motivation independently"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Team Development",
        "situation_type": "Motivation_Building"
    },
    {
        "id": "lq6",
        "text": "An unexpected crisis requires an immediate decision that could significantly impact the project. What do you do?",
        "options": [
            "Assess the situation quickly and make the decision based on your experience and judgment",
            "Rapidly consult with key stakeholders and make a group decision within the time constraint",
            "Delegate the decision to the team member closest to the situation"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Crisis Management",
        "situation_type": "Emergency_Decision"
    },
    {
        "id": "lq7",
        "text": "Your team proposes implementing a new innovative process that could improve efficiency but carries some risk. How do you respond?",
        "options": [
            "Evaluate the proposal yourself and decide whether to approve implementation",
            "Organize a team workshop to thoroughly analyze risks and benefits before deciding together",
            "Encourage them to pilot the process independently and learn from the experience"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Innovation",
        "situation_type": "Change_Management"
    },
    {
        "id": "lq8",
        "text": "During a strategy meeting, a team member challenges your proposed approach with alternative ideas. How do you handle this?",
        "options": [
            "Acknowledge their input but proceed with your original plan as the final decision-maker",
            "Pause to explore their alternative thoroughly and integrate the best elements from both approaches",
            "Open the floor for broader team discussion and let the group determine the best path forward"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Team Development",
        "situation_type": "Idea_Management"
    },
    {
        "id": "lq9",
        "text": "Quality issues are emerging in your team's deliverables, potentially affecting client satisfaction. What's your immediate response?",
        "options": [
            "Implement strict quality control checkpoints and personally review all work before delivery",
            "Work with the team to identify root causes and develop quality improvement processes together",
            "Trust the team to recognize the quality issues and implement their own improvement measures"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Performance Management",
        "situation_type": "Quality_Control"
    },
    {
        "id": "lq10",
        "text": "It's time for annual performance reviews. How do you approach these conversations?",
        "options": [
            "Prepare thorough evaluations based on your observations and provide clear direction for improvement",
            "Create a collaborative discussion where you and the employee assess performance together",
            "Ask employees to self-evaluate and provide feedback only when they request guidance"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Performance Management",
        "situation_type": "Performance_Review"
    },
    {
        "id": "lq11",
        "text": "A technical problem emerges that could delay delivery to an important client. The solution isn't immediately obvious. How do you react?",
        "options": [
            "Take charge of troubleshooting and coordinate the technical response yourself",
            "Bring together relevant team members to brainstorm solutions and decide on the approach collectively",
            "Assign the most technically capable team member to lead the problem-solving effort independently"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Problem Solving",
        "situation_type": "Technical_Challenge"
    },
    {
        "id": "lq12",
        "text": "Your organization needs fresh ideas for process improvement. You're leading a brainstorming session. How do you run it?",
        "options": [
            "Structure the session with specific topics and guide discussion toward practical solutions",
            "Facilitate an open discussion where everyone contributes ideas and help the group build on each other's thoughts",
            "Set up the session parameters and let the team generate and evaluate ideas with minimal interference"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Innovation",
        "situation_type": "Creative_Process"
    },
    {
        "id": "lq13",
        "text": "You notice that one team member consistently dominates discussions while others remain quiet. What do you do?",
        "options": [
            "Directly manage speaking time by setting specific rules for participation",
            "Actively facilitate by inviting quieter members to share while diplomatically managing the dominant speaker",
            "Let the team dynamics evolve naturally without direct intervention"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Team Development",
        "situation_type": "Group_Dynamics"
    },
    {
        "id": "lq14",
        "text": "Your team needs to learn new skills to handle an upcoming project, but training time is limited. How do you approach this?",
        "options": [
            "Identify the most critical skills and assign specific training requirements to each team member",
            "Discuss skill gaps with the team and collaboratively plan a learning approach that works for everyone",
            "Provide learning resources and trust team members to develop the skills they feel they need most"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Team Development",
        "situation_type": "Skill_Development"
    },
    {
        "id": "lq15",
        "text": "Budget constraints require your team to reduce project scope. How do you determine what to cut?",
        "options": [
            "Analyze project priorities yourself and make cuts based on your understanding of business needs",
            "Facilitate team discussions to evaluate options and make collective decisions about scope reductions",
            "Present the constraint to the team and let them determine how to adjust their work accordingly"
        ],
        "styles": ["Autocratic", "Democratic", "Laissez-Faire"],
        "context": "Resource Management",
        "situation_type": "Budget_Constraint"
    }
]

def seed_leadership_questions():
    """Seed enhanced leadership questions to Firestore"""
    
    collection_ref = db.collection("leadership_questions")
    
    # Clear existing questions first (optional)
    print("Clearing existing leadership questions...")
    existing_docs = collection_ref.stream()
    for doc in existing_docs:
        doc.reference.delete()
    
    # Add enhanced questions
    print("Seeding enhanced leadership questions...")
    for question in LEADERSHIP_QUESTIONS:
        collection_ref.document(question["id"]).set(question)
    
    print(f"✅ Successfully seeded {len(LEADERSHIP_QUESTIONS)} enhanced leadership questions")
    
    # Verify the seeding
    verify_count = len(list(collection_ref.stream()))
    print(f"✅ Verification: {verify_count} questions now in database")

if __name__ == "__main__":
    seed_leadership_questions()