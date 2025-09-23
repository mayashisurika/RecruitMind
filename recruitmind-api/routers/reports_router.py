from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import firestore
from typing import Optional, Dict, Any, List
from datetime import datetime
import urllib.parse

router = APIRouter(prefix="/reports", tags=["Reports"])

class CandidateReport(BaseModel):
    candidate_info: Dict[str, Any]
    mbti_results: Optional[Dict[str, Any]] = None
    leadership_results: Optional[Dict[str, Any]] = None
    video_analysis: Optional[Dict[str, Any]] = None
    video_submissions: Optional[Dict[str, Any]] = None  # New field for video submissions
    hr_insights: Dict[str, Any]
    completion_status: Dict[str, Any]

def generate_hr_insights(candidate_data: Dict[str, Any], mbti: Optional[Dict], leadership: Optional[Dict], video: Optional[Dict]) -> Dict[str, Any]:
    """Generate professional HR insights based on all assessment data"""
    
    insights = {
        "overall_recommendation": "Pending - Assessments Incomplete",
        "key_strengths": [],
        "areas_for_development": [],
        "personality_summary": "No personality assessment completed",
        "leadership_potential": "No leadership assessment completed",
        "interview_performance": "No video analysis completed",
        "cultural_fit_score": 0,
        "role_suitability": "To be determined",
        "next_steps": []
    }
    
    # MBTI Analysis
    if mbti and mbti.get('results'):
        mbti_type = mbti['results'].get('personality_type', 'Unknown')
        insights["personality_summary"] = f"MBTI Type: {mbti_type}"
        
        # Add MBTI-based strengths
        mbti_strengths = {
            'ENFJ': ['Natural leadership', 'Excellent communication', 'Team motivation'],
            'INTJ': ['Strategic thinking', 'Independent work', 'Long-term planning'],
            'ESTJ': ['Organization', 'Practical execution', 'Team management'],
            'INFP': ['Creativity', 'Adaptability', 'Value-driven decisions'],
            # Add more types as needed
        }
        
        if mbti_type in mbti_strengths:
            insights["key_strengths"].extend(mbti_strengths[mbti_type])
    
    # Leadership Assessment Analysis
    if leadership and leadership.get('results'):
        scores = leadership['results'].get('scores', {})
        total_score = sum(scores.values()) if scores else 0
        avg_score = total_score / len(scores) if scores else 0
        
        if avg_score >= 4.0:
            insights["leadership_potential"] = "High - Strong leadership capabilities demonstrated"
            insights["key_strengths"].append("Strong leadership potential")
        elif avg_score >= 3.0:
            insights["leadership_potential"] = "Moderate - Good foundation with room for growth"
        else:
            insights["leadership_potential"] = "Developing - Requires leadership development support"
            insights["areas_for_development"].append("Leadership skills development needed")
    
    # Video Analysis Insights
    if video and video.get('results'):
        emotions = video['results'].get('emotion_summary', {})
        avg_confidence = video['results'].get('average_confidence', 0)
        
        if avg_confidence >= 0.7:
            insights["interview_performance"] = "Excellent - High confidence and emotional stability"
            insights["key_strengths"].append("Strong interview presence")
        elif avg_confidence >= 0.5:
            insights["interview_performance"] = "Good - Appropriate emotional responses"
        else:
            insights["interview_performance"] = "Needs improvement - Low confidence detected"
            insights["areas_for_development"].append("Interview confidence and communication")
        
        # Analyze dominant emotions
        if emotions:
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            if dominant_emotion[0] in ['happy', 'neutral'] and dominant_emotion[1] > 0.5:
                insights["key_strengths"].append("Positive demeanor during interview")
    
    # Overall Recommendation Logic
    completed_assessments = sum([bool(mbti), bool(leadership), bool(video)])
    
    if completed_assessments >= 2:
        if len(insights["key_strengths"]) >= 3:
            insights["overall_recommendation"] = "Highly Recommended - Strong candidate profile"
            insights["cultural_fit_score"] = 85
            insights["role_suitability"] = "Excellent fit for leadership roles"
        elif len(insights["areas_for_development"]) <= 2:
            insights["overall_recommendation"] = "Recommended - Good candidate with potential"
            insights["cultural_fit_score"] = 70
            insights["role_suitability"] = "Good fit with proper onboarding"
        else:
            insights["overall_recommendation"] = "Consider with reservations"
            insights["cultural_fit_score"] = 55
            insights["role_suitability"] = "May require additional training and support"
    
    # Next Steps Recommendations
    if not mbti:
        insights["next_steps"].append("Complete personality assessment")
    if not leadership:
        insights["next_steps"].append("Complete leadership evaluation")
    if not video:
        insights["next_steps"].append("Schedule video interview")
    
    if completed_assessments >= 2:
        insights["next_steps"].extend([
            "Schedule final interview with hiring manager",
            "Check references and background",
            "Prepare onboarding plan"
        ])
    
    return insights

def fetch_assessment_data(db, collection_name: str, candidate_id: str, candidate_email: str):
    """Helper function to fetch assessment data by ID first, then by email if needed"""
    
    # Create variations of the identifiers to try based on collection type
    identifiers_to_try = []
    
    if candidate_email:
        if collection_name in ["video_submissions", "emotion_analysis"]:
            # These collections use URL-encoded emails as document IDs
            encoded_email = candidate_email.replace("@", "%40")
            identifiers_to_try.append(encoded_email)
        else:
            # MBTI and leadership use regular emails
            identifiers_to_try.append(candidate_email)
    
    if candidate_id:
        identifiers_to_try.append(candidate_id)
        # Add URL decoded version if it contains %40
        if "%40" in candidate_id:
            identifiers_to_try.append(candidate_id.replace("%40", "@"))
    
    # Try each identifier as document ID
    for identifier in identifiers_to_try:
        try:
            if identifier:  # Make sure identifier is not empty
                doc = db.collection(collection_name).document(identifier).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    return data
        except Exception as e:
            print(f"Error fetching {collection_name} by identifier {identifier}: {e}")
    
    # For emotion_analysis and video_submissions, also try querying by candidate_id field
    if collection_name in ["emotion_analysis", "video_submissions"] and candidate_email:
        encoded_email = candidate_email.replace("@", "%40")
        try:
            query = db.collection(collection_name).where("candidate_id", "==", encoded_email).limit(1).get()
            for doc in query:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            print(f"Error querying {collection_name} by candidate_id field {encoded_email}: {e}")
    
    # Try querying by email field for other collections
    if candidate_email and collection_name not in ["video_submissions", "emotion_analysis"]:
        try:
            query = db.collection(collection_name).where("email", "==", candidate_email).limit(1).get()
            for doc in query:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            print(f"Error querying {collection_name} by email field {candidate_email}: {e}")
    
    return None

@router.get("/{candidate_id}", response_model=CandidateReport)
async def get_candidate_report(candidate_id: str):
    """Generate comprehensive candidate report with all assessment data"""
    try:
        db = firestore.client()
        
        # Fetch candidate basic info
        candidate_doc = db.collection("candidates").document(candidate_id).get()
        candidate_data = None
        candidate_email = None
        
        if candidate_doc.exists:
            candidate_data = candidate_doc.to_dict()
            candidate_email = candidate_data.get("email", "")
        else:
            # Try to find candidate by email if candidate_id looks like an email
            if "@" in candidate_id:
                query = db.collection("candidates").where("email", "==", candidate_id).limit(1).get()
                for doc in query:
                    candidate_data = doc.to_dict()
                    candidate_email = candidate_data.get("email", "")
                    candidate_id = doc.id  # Update candidate_id to the actual document ID
                    break
        
        if not candidate_data:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        candidate_info = {
            "id": candidate_id,
            "name": candidate_data.get("name", "Unknown"),
            "email": candidate_email,
            "created_at": candidate_data.get("createdAt"),
            "active": candidate_data.get("active", True)
        }
        
        # Fetch assessment results using the helper function
        mbti_results = fetch_assessment_data(db, "mbti_results", candidate_id, candidate_email)
        leadership_results = fetch_assessment_data(db, "leadership_results", candidate_id, candidate_email)
        video_analysis = fetch_assessment_data(db, "emotion_analysis", candidate_id, candidate_email)
        
        # Fetch video submissions data (uses URL-encoded email)
        video_submissions = fetch_assessment_data(db, "video_submissions", candidate_id, candidate_email)
        
        # Generate HR insights
        hr_insights = generate_hr_insights(candidate_data, mbti_results, leadership_results, video_analysis)
        
        # Calculate completion status - video is completed if either video_submissions or video_analysis exists
        video_completed = video_submissions is not None or video_analysis is not None
        
        completion_status = {
            "mbti_completed": mbti_results is not None,
            "leadership_completed": leadership_results is not None,
            "video_completed": video_completed,
            "overall_completion": sum([
                mbti_results is not None,
                leadership_results is not None,
                video_completed
            ])
        }
        
        return CandidateReport(
            candidate_info=candidate_info,
            mbti_results=mbti_results,
            leadership_results=leadership_results,
            video_analysis=video_analysis,
            video_submissions=video_submissions,
            hr_insights=hr_insights,
            completion_status=completion_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/{candidate_id}/summary")
async def get_candidate_summary(candidate_id: str):
    """Get a quick summary of candidate assessment status"""
    try:
        db = firestore.client()
        
        # Check if candidate exists
        candidate_doc = db.collection("candidates").document(candidate_id).get()
        candidate_data = None
        candidate_email = None
        
        if candidate_doc.exists:
            candidate_data = candidate_doc.to_dict()
            candidate_email = candidate_data.get("email", "")
        else:
            # Try to find candidate by email if candidate_id looks like an email
            if "@" in candidate_id:
                try:
                    query = db.collection("candidates").where("email", "==", candidate_id).limit(1).get()
                    for doc in query:
                        candidate_data = doc.to_dict()
                        candidate_email = candidate_data.get("email", "")
                        candidate_id = doc.id  # Update candidate_id to the actual document ID
                        break
                except Exception as e:
                    print(f"Error querying candidate by email: {e}")
        
        if not candidate_data:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check completed assessments using helper function
        mbti_completed = fetch_assessment_data(db, "mbti_results", candidate_id, candidate_email) is not None
        leadership_completed = fetch_assessment_data(db, "leadership_results", candidate_id, candidate_email) is not None
        video_analysis_completed = fetch_assessment_data(db, "emotion_analysis", candidate_id, candidate_email) is not None
        video_submissions_completed = fetch_assessment_data(db, "video_submissions", candidate_id, candidate_email) is not None
        
        # Video is completed if either analysis or submission exists
        video_completed = video_analysis_completed or video_submissions_completed
        
        assessments = {
            "mbti": mbti_completed,
            "leadership": leadership_completed,
            "video": video_completed
        }
        
        completed_count = sum(assessments.values())
        completion_percentage = (completed_count / 3) * 100
        
        return {
            "candidate_id": candidate_id,
            "name": candidate_data.get("name", "Unknown"),
            "email": candidate_email,
            "assessments": assessments,
            "completed_count": completed_count,
            "total_assessments": 3,
            "completion_percentage": completion_percentage,
            "status": "Complete" if completed_count == 3 else "In Progress" if completed_count > 0 else "Pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting candidate summary: {str(e)}")