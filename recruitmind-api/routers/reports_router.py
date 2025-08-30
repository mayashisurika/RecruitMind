from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import firestore
from typing import Optional, Dict, Any, List
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

class CandidateReport(BaseModel):
    candidate_info: Dict[str, Any]
    mbti_results: Optional[Dict[str, Any]] = None
    leadership_results: Optional[Dict[str, Any]] = None
    video_analysis: Optional[Dict[str, Any]] = None
    hr_insights: Dict[str, Any]
    completion_status: Dict[str, bool]

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

@router.get("/{candidate_id}", response_model=CandidateReport)
async def get_candidate_report(candidate_id: str):
    """Generate comprehensive candidate report with all assessment data"""
    try:
        db = firestore.client()
        
        # Fetch candidate basic info
        candidate_doc = db.collection("candidates").document(candidate_id).get()
        if not candidate_doc.exists:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        candidate_data = candidate_doc.to_dict()
        candidate_info = {
            "id": candidate_id,
            "name": candidate_data.get("name", "Unknown"),
            "email": candidate_data.get("email", ""),
            "created_at": candidate_data.get("createdAt"),
            "active": candidate_data.get("active", True)
        }
        
        # Fetch MBTI results - data stored under candidateId as document ID
        mbti_results = None
        try:
            mbti_doc = db.collection("mbti_results").document(candidate_id).get()
            if mbti_doc.exists:
                mbti_results = mbti_doc.to_dict()
                mbti_results["id"] = mbti_doc.id
        except Exception as e:
            print(f"Error fetching MBTI results: {e}")
        
        # Fetch Leadership results - data stored under candidateId as document ID
        leadership_results = None
        try:
            leadership_doc = db.collection("leadership_results").document(candidate_id).get()
            if leadership_doc.exists:
                leadership_results = leadership_doc.to_dict()
                leadership_results["id"] = leadership_doc.id
        except Exception as e:
            print(f"Error fetching leadership results: {e}")
        
        # Fetch Video Analysis results - data stored under candidateId as document ID
        video_analysis = None
        try:
            video_doc = db.collection("emotion_analysis").document(candidate_id).get()
            if video_doc.exists:
                video_analysis = video_doc.to_dict()
                video_analysis["id"] = video_doc.id
        except Exception as e:
            print(f"Error fetching video analysis: {e}")
        
        # Generate HR insights
        hr_insights = generate_hr_insights(candidate_data, mbti_results, leadership_results, video_analysis)
        
        # Calculate completion status
        completion_status = {
            "mbti_completed": mbti_results is not None,
            "leadership_completed": leadership_results is not None,
            "video_completed": video_analysis is not None,
            "overall_completion": sum([
                mbti_results is not None,
                leadership_results is not None,
                video_analysis is not None
            ])
        }
        
        return CandidateReport(
            candidate_info=candidate_info,
            mbti_results=mbti_results,
            leadership_results=leadership_results,
            video_analysis=video_analysis,
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
        if not candidate_doc.exists:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        candidate_data = candidate_doc.to_dict()
        
        # Count completed assessments - check by document ID
        assessments = {
            "mbti": db.collection("mbti_results").document(candidate_id).get().exists,
            "leadership": db.collection("leadership_results").document(candidate_id).get().exists,
            "video": db.collection("emotion_analysis").document(candidate_id).get().exists
        }
        
        completed_count = sum(assessments.values())
        completion_percentage = (completed_count / 3) * 100
        
        return {
            "candidate_id": candidate_id,
            "name": candidate_data.get("name", "Unknown"),
            "email": candidate_data.get("email", ""),
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