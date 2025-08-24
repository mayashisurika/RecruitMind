# recruitmind-api/scripts/seed_questions.py
from utils.firebase_configuration import db

MBTI_STRINGS = [
  "I enjoy spending time alone.",
  "I make decisions based on logic rather than emotions.",
  "I like trying new experiences.",
  "I prefer structured plans over spontaneity.",
  "I find it easy to empathize with others.",
  "I focus more on the present than the future.",
  "I find it easy to start conversations.",
  "I enjoy working in teams.",
  "I like to take the lead in group projects.",
  "I prefer clear instructions at work.",
  "I adapt quickly to unexpected changes at work.",
  "I prefer detailed tasks over creative brainstorming.",
  "I find it easy to stay motivated at work.",
  "I like setting long-term goals in my job.",
  "I enjoy brainstorming ideas with colleagues.",
  "I prefer to plan tasks in detail before starting.",
  "I gain energy from interacting with people at work.",
  "I feel comfortable taking the lead in group projects.",
  "I find it easy to stay calm in stressful situations.",
  "I prefer focusing on long-term goals rather than day-to-day details.",
  "I am more motivated by achieving team success than individual recognition.",
  "I like experimenting with new approaches at work.",
  "I prefer clear instructions over ambiguous guidelines.",
  "I find it easy to motivate others when they lose focus.",
  "I prefer structured schedules rather than flexible ones.",
  "I enjoy solving conflicts between teammates.",
  "I like to keep my workspace neat and organized.",
  "I would rather work in a team than alone.",
  "I adapt quickly when plans change.",
  "I prefer to focus on facts rather than possibilities.",
  "I feel energized when presenting my ideas to a group.",
  "I often notice details that others might miss.",
  "I prefer jobs that allow creativity over routine tasks.",
  "I find it easy to delegate tasks to others.",
  "I tend to think through problems logically rather than emotionally.",
  "I prefer to follow established methods rather than invent new ones.",
  "I enjoy receiving feedback from colleagues.",
  "I remain optimistic even during setbacks.",
  "I feel comfortable making quick decisions.",
  "I prefer finishing one task before starting another.",
  "I am motivated by deadlines.",
  "I often think about how my decisions affect others.",
  "I prefer to keep discussions focused on the facts.",
  "I enjoy working in fast-paced environments.",
  "I value traditions and established ways of doing things.",
  "I enjoy encouraging teammates to share their ideas.",
  "I find it easy to stay focused even with distractions.",
  "I prefer roles where I can support others rather than lead.",
  "I enjoy analyzing data to find patterns and insights.",
  "I often take initiative without being asked.",
  "I prefer work that has practical outcomes over abstract ideas.",
  "I am motivated by achieving personal milestones.",
  "I often look for innovative solutions to challenges.",
  "I am comfortable handling criticism.",
  "I prefer having a few close work relationships over many casual ones.",
  "I often anticipate potential risks before others notice.",
  "I find it easy to explain complex ideas clearly.",
  "I enjoy jobs that allow flexibility and spontaneity.",
  "I prefer collaborating on decisions rather than deciding alone.",
  "I am energized by meeting new people.",
  "I feel satisfied when helping colleagues grow.",
  "I prefer to focus on the present rather than the future.",
  "I am motivated by recognition and praise.",
  "I feel comfortable taking responsibility for team outcomes."

]

VIDEO_QUESTIONS = [
  {"id": "v1", "text": "Tell us about a challenge you faced at work and how you handled it."},
  {"id": "v2", "text": "How do you handle conflict within a team?"},
  {"id": "v3", "text": "Describe a situation where you had to quickly adapt to change."}
]

def seed_mbti():
    options = ["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"]
    for i, q in enumerate(MBTI_STRINGS, start=1):
        doc = {
            "id": f"q{i}",
            "question": q,
            "options": options
        }
        db.collection("mbti_questions").document(doc["id"]).set(doc)
    print("✅ Seeded mbti_questions")

def seed_video():
    for q in VIDEO_QUESTIONS:
        db.collection("video_questions").document(q["id"]).set(q)
    print("✅ Seeded video_questions")

if __name__ == "__main__":
    seed_mbti()
    seed_video()
