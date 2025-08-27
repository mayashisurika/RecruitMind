# RecruitMind/recruitmind-api/routers/emotion_analysis.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from firebase_admin import firestore
import sys
import os
from datetime import datetime

# Add the facial-recognition module to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'facial-recognition')))
# Import the emotion analysis function from the facial-recognition module
from emotion_detector import analyze_video_from_url

router = APIRouter(prefix="/api/v1", tags=["emotion-analysis"])

# Request models
class EmotionAnalysisRequest(BaseModel):
    candidate_id: str
    video_submission_id: str

class BulkEmotionAnalysisRequest(BaseModel):
    candidate_ids: list[str]

# Response models
class EmotionAnalysisResponse(BaseModel):
    message: str
    candidate_id: str
    video_submission_id: str
    status: str

@router.post("/analyze-video-emotions", response_model=EmotionAnalysisResponse)
async def start_emotion_analysis(
    request: EmotionAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Start emotion analysis for a specific video submission
    Analysis runs in background to avoid blocking
    """
    try:
        # Get video URL from Firestore - check both main collection and candidate subcollection
        db = firestore.client()
        video_url = None
        video_data = None
        
        # First, try to get from main video_submissions collection
        video_doc = db.collection('video_submissions').document(request.video_submission_id).get()
        
        if video_doc.exists:
            video_data = video_doc.to_dict()
            video_url = video_data.get('cloudinary_url') or video_data.get('video_url')
        
        # If not found, try candidate's subcollection
        if not video_url:
            candidate_video_doc = db.collection('candidates').document(request.candidate_id).collection('video_submissions').document(request.video_submission_id).get()
            
            if candidate_video_doc.exists:
                video_data = candidate_video_doc.to_dict()
                video_url = video_data.get('cloudinary_url') or video_data.get('video_url')
        
        # If still not found, search by candidate_id in main collection
        if not video_url:
            video_submissions = db.collection('video_submissions').where('candidate_id', '==', request.candidate_id).get()
            
            for doc in video_submissions:
                doc_data = doc.to_dict()
                if doc_data.get('cloudinary_url') or doc_data.get('video_url'):
                    video_data = doc_data
                    video_url = doc_data.get('cloudinary_url') or doc_data.get('video_url')
                    request.video_submission_id = doc.id  # Update with actual doc ID
                    break
        
        if not video_url:
            raise HTTPException(status_code=404, detail="Video submission not found or video URL missing")
        
        print(f"Found video URL for candidate {request.candidate_id}: {video_url[:50]}...")
        
        # Check if analysis already exists
        existing_analysis = db.collection('emotion_analysis').where(
            'video_submission_id', '==', request.video_submission_id
        ).limit(1).get()
        
        if existing_analysis:
            return EmotionAnalysisResponse(
                message="Emotion analysis already exists for this video",
                candidate_id=request.candidate_id,
                video_submission_id=request.video_submission_id,
                status="already_analyzed"
            )
        
        # Start background analysis
        background_tasks.add_task(
            process_emotion_analysis_task,
            request.candidate_id,
            request.video_submission_id,
            video_url
        )
        
        # Update video submission status
        db.collection('video_submissions').document(request.video_submission_id).update({
            'emotion_analysis_status': 'processing',
            'emotion_analysis_started': firestore.SERVER_TIMESTAMP
        })
        
        return EmotionAnalysisResponse(
            message="Emotion analysis started successfully",
            candidate_id=request.candidate_id,
            video_submission_id=request.video_submission_id,
            status="processing"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


@router.get("/emotion-analysis/{candidate_id}")
async def get_emotion_analysis(candidate_id: str):
    """Get emotion analysis results for a candidate"""
    try:
        db = firestore.client()
        
        # Get latest emotion analysis for candidate
        analysis_docs = db.collection('emotion_analysis').where(
            'candidate_id', '==', candidate_id
        ).order_by('analysis_timestamp', direction=firestore.Query.DESCENDING).limit(1).get()
        
        if not analysis_docs:
            raise HTTPException(
                status_code=404, 
                detail="No emotion analysis found for this candidate"
            )
        
        analysis_doc = analysis_docs[0]
        analysis_data = analysis_doc.to_dict()
        
        return {
            "candidate_id": candidate_id,
            "analysis_id": analysis_doc.id,
            "video_submission_id": analysis_data.get('video_submission_id'),
            "status": analysis_data.get('status'),
            "analysis": analysis_data.get('analysis_result'),
            "analyzed_at": analysis_data.get('analysis_timestamp'),
            "confidence_level": analysis_data.get('analysis_result', {}).get('analysis', {}).get('confidence_level', 'unknown')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")


@router.get("/emotion-analysis")
async def get_all_emotion_analyses():
    """Get all emotion analyses for admin dashboard"""
    try:
        db = firestore.client()
        
        # Get all analyses, ordered by timestamp
        analyses = db.collection('emotion_analysis').order_by(
            'analysis_timestamp', direction=firestore.Query.DESCENDING
        ).limit(50).get()
        
        results = []
        for doc in analyses:
            data = doc.to_dict()
            
            # Get candidate name and email from candidates collection
            candidate_name = "Unknown"
            candidate_email = "Unknown"
            try:
                candidate_doc = db.collection('candidates').document(data.get('candidate_id')).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    candidate_name = f"{candidate_data.get('firstName', '')} {candidate_data.get('lastName', '')}".strip()
                    candidate_email = candidate_data.get('email', 'Unknown')
            except:
                pass
            
            # Get video URL for reference
            video_url = None
            try:
                video_doc = db.collection('video_submissions').document(data.get('video_submission_id', '')).get()
                if video_doc.exists:
                    video_data = video_doc.to_dict()
                    video_url = video_data.get('cloudinary_url', video_data.get('video_url'))
            except:
                pass
            
            results.append({
                "analysis_id": doc.id,
                "candidate_id": data.get('candidate_id'),
                "candidate_name": candidate_name,
                "candidate_email": candidate_email,
                "video_submission_id": data.get('video_submission_id'),
                "video_url": video_url,
                "status": data.get('status'),
                "dominant_emotion": data.get('analysis_result', {}).get('analysis', {}).get('dominant_emotion'),
                "confidence_level": data.get('analysis_result', {}).get('analysis', {}).get('confidence_level'),
                "analyzed_at": data.get('analysis_timestamp'),
                "duration": data.get('analysis_result', {}).get('duration'),
                "insights_count": len(data.get('analysis_result', {}).get('analysis', {}).get('insights', []))
            })
        
        return {
            "analyses": results,
            "total_count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analyses: {str(e)}")


@router.post("/analyze-all-pending")
async def analyze_all_pending_videos(background_tasks: BackgroundTasks):
    """Analyze all videos that don't have emotion analysis yet"""
    try:
        db = firestore.client()
        
        # Get all video submissions without emotion analysis
        # Check multiple possible status values
        video_submissions_query1 = db.collection('video_submissions').where(
            'emotion_analysis_status', '==', None
        ).get()
        
        video_submissions_query2 = db.collection('video_submissions').where(
            'emotion_analysis_status', 'not-in', ['completed', 'processing', 'failed']
        ).get()
        
        # Also get submissions that don't have the field at all
        all_submissions = db.collection('video_submissions').get()
        
        # Combine and filter unique submissions
        pending_videos = []
        processed_ids = set()
        
        # Add from queries
        for doc in video_submissions_query1 + video_submissions_query2:
            if doc.id not in processed_ids:
                pending_videos.append(doc)
                processed_ids.add(doc.id)
        
        # Add submissions without emotion_analysis_status field
        for doc in all_submissions:
            doc_data = doc.to_dict()
            if ('emotion_analysis_status' not in doc_data or 
                doc_data.get('emotion_analysis_status') is None) and doc.id not in processed_ids:
                pending_videos.append(doc)
                processed_ids.add(doc.id)
        
        if not pending_videos:
            return {
                "message": "No pending videos found for analysis",
                "count": 0
            }
        
        processed_count = 0
        
        for video_doc in pending_videos:
            video_data = video_doc.to_dict()
            candidate_id = video_data.get('candidate_id')
            video_url = video_data.get('cloudinary_url') or video_data.get('video_url')
            
            if candidate_id and video_url:
                # Start background analysis
                background_tasks.add_task(
                    process_emotion_analysis_task,
                    candidate_id,
                    video_doc.id,
                    video_url
                )
                
                # Update status
                db.collection('video_submissions').document(video_doc.id).update({
                    'emotion_analysis_status': 'processing',
                    'emotion_analysis_started': firestore.SERVER_TIMESTAMP
                })
                
                processed_count += 1
                print(f"Queued analysis for candidate {candidate_id}: {video_url[:50]}...")
        
        return {
            "message": f"Started emotion analysis for {processed_count} videos",
            "count": processed_count,
            "total_found": len(pending_videos)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start bulk analysis: {str(e)}")


# Background task function
async def process_emotion_analysis_task(candidate_id: str, video_submission_id: str, video_url: str):
    """Background task to process video emotion analysis"""
    db = firestore.client()
    
    try:
        print(f"Starting emotion analysis for candidate {candidate_id}")
        
        # Run emotion analysis (this is the CPU-intensive part)
        analysis_result = analyze_video_from_url(video_url, confidence_threshold=0.7)
        
        # Prepare data for storage
        emotion_analysis_doc = {
            "candidate_id": candidate_id,
            "video_submission_id": video_submission_id,
            "status": analysis_result['status'],
            "analysis_result": analysis_result,
            "analysis_timestamp": firestore.SERVER_TIMESTAMP,
            "analysis_version": "v1.0"
        }
        
        # Save analysis to Firestore
        db.collection('emotion_analysis').add(emotion_analysis_doc)
        
        # Update video submission status
        update_data = {
            'emotion_analysis_status': 'completed',
            'emotion_analysis_completed': firestore.SERVER_TIMESTAMP
        }
        
        # Add summary to video submission
        if analysis_result['status'] == 'success':
            analysis = analysis_result.get('analysis', {})
            update_data.update({
                'emotion_dominant': analysis.get('dominant_emotion'),
                'emotion_confidence': analysis.get('confidence_level'),
                'emotion_detection_rate': analysis.get('detection_rate')
            })
        
        db.collection('video_submissions').document(video_submission_id).update(update_data)
        
        print(f"Emotion analysis completed successfully for candidate {candidate_id}")
        
    except Exception as e:
        error_message = str(e)
        print(f"Emotion analysis failed for candidate {candidate_id}: {error_message}")
        
        # Update with error status
        try:
            db.collection('video_submissions').document(video_submission_id).update({
                'emotion_analysis_status': 'failed',
                'emotion_analysis_error': error_message,
                'emotion_analysis_completed': firestore.SERVER_TIMESTAMP
            })
            
            # Also save failed analysis record
            db.collection('emotion_analysis').add({
                "candidate_id": candidate_id,
                "video_submission_id": video_submission_id,
                "status": "error",
                "error_message": error_message,
                "analysis_timestamp": firestore.SERVER_TIMESTAMP,
                "analysis_version": "v1.0"
            })
            
        except Exception as db_error:
            print(f"Failed to update error status: {db_error}")


@router.delete("/emotion-analysis/{analysis_id}")
async def delete_emotion_analysis(analysis_id: str):
    """Delete an emotion analysis record"""
    try:
        db = firestore.client()
        
        # Check if analysis exists
        analysis_doc = db.collection('emotion_analysis').document(analysis_id).get()
        if not analysis_doc.exists:
            raise HTTPException(status_code=404, detail="Emotion analysis not found")
        
        # Delete the analysis
        db.collection('emotion_analysis').document(analysis_id).delete()
        
        return {"message": "Emotion analysis deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")