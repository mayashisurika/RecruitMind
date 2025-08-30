from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from utils.firebase_configuration import db
import cloudinary
import cloudinary.uploader
import random
from datetime import datetime
import logging
import os
import httpx
from fastapi import BackgroundTasks
from dotenv import load_dotenv

load_dotenv()

# # Dummy implementation for trigger_emotion_analysis
# # Replace this with your actual emotion analysis logic or import
# def trigger_emotion_analysis(candidate_id: str, video_doc_id: str):
#     # Example: Log the trigger, or call an external service
#     logger.info(f"Triggering emotion analysis for candidate {candidate_id}, video doc {video_doc_id}")
#     # Actual emotion analysis logic goes here
#     pass


router = APIRouter(tags=["Video"])

# Configure Cloudinary with environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

logger = logging.getLogger(__name__)

class VideoSessionComplete(BaseModel):
    candidate_id: str
    total_duration: float
    questions_answered: list[str]

# GET 2 random video questions for a candidate
@router.get("/video-questions")
async def get_video_questions(candidate_id: str):
    try:
        # Fetch all questions from Firestore collection
        docs = db.collection("video_questions").stream()
        questions = []
        
        for doc in docs:
            question_data = doc.to_dict()
            questions.append({
                "id": doc.id,
                "question": question_data.get("text", ""),
                "version": question_data.get("version", "v1")
            })

        if not questions:
            raise HTTPException(status_code=404, detail="No video questions found")

        # Pick 2 random questions
        selected_questions = random.sample(questions, min(2, len(questions)))
        
        # Store selected questions for this candidate session
        session_data = {
            "candidate_id": candidate_id,
            "questions": selected_questions,
            "created_at": datetime.now(),
            "status": "started"
        }
        
        # Store session in Firestore
        session_ref = db.collection("video_sessions").document()
        session_ref.set(session_data)
        
        return {
            "session_id": session_ref.id,
            "questions": [q["question"] for q in selected_questions]
        }
        
    except Exception as e:
        logger.error(f"Error fetching video questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch questions")

# POST video upload to Cloudinary and save metadata
@router.post("/video-submission")
async def submit_video(
    background_tasks: BackgroundTasks,  # Add this line
    candidate_id: str = Form(...),
    session_id: str = Form(...),
    duration_seconds: float = Form(...),
    video: UploadFile = File(...)
):
    try:
        # Validate file type
        if not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Invalid file type. Only video files allowed.")
        
        # Read video file
        video_content = await video.read()
        
        # Upload to Cloudinary with candidate-specific organization
        upload_result = cloudinary.uploader.upload(
            video_content,
            resource_type="video",
            public_id=f"candidate_{candidate_id}_interview_{session_id}",
            folder=f"recruitmind/candidates/{candidate_id}/video_interviews",
            overwrite=True,
            tags=[f"candidate_{candidate_id}", "video_interview", "recruitmind"]
        )
        
        # Get session data to retrieve questions
        session_doc = db.collection("video_sessions").document(session_id).get()
        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_data = session_doc.to_dict()
        
        # Prepare video record data with candidate organization
        video_record = {
            "candidate_id": candidate_id,
            "session_id": session_id,
            "video_url": upload_result["secure_url"],
            "cloudinary_public_id": upload_result["public_id"],
            "cloudinary_folder": f"recruitmind/candidates/{candidate_id}/video_interviews",
            "duration_seconds": duration_seconds,
            "questions": session_data.get("questions", []),
            "file_size": len(video_content),
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),
            "height": upload_result.get("height"),
            "submitted_at": datetime.now(),
            "status": "completed",
            "metadata": {
                "user_agent": "recruitmind_web_app",
                "upload_timestamp": datetime.now().isoformat(),
                "file_name": f"candidate_{candidate_id}_interview.webm"
            }
        }
        
        # Save video record to candidate-specific collection
        video_ref = db.collection("candidates").document(candidate_id).collection("video_submissions").add(video_record)

        # Also save to main collection for admin queries
        main_video_ref = db.collection("video_submissions").add(video_record)
        main_video_doc_id = main_video_ref[1].id  # Get the document ID from main collection

        # Update session status
        db.collection("video_sessions").document(session_id).update({
            "status": "completed",
            "completed_at": datetime.now(),
            "video_url": upload_result["secure_url"]
        })
        
        # Trigger emotion analysis automatically
        background_tasks.add_task(
            trigger_emotion_analysis,
            candidate_id,
            main_video_doc_id
        )

        return {
            "success": True,
            "message": "Video submitted successfully. Emotion analysis will be processed automatically.",
            "video_url": upload_result["secure_url"],
            "duration": duration_seconds
        }
        
    except Exception as e:
        logger.error(f"Error submitting video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit video: {str(e)}")

# GET video submissions for admin (optional)
@router.get("/video-submissions/{candidate_id}")
async def get_candidate_videos(candidate_id: str):
    try:
        # Get from candidate-specific subcollection first
        candidate_docs = db.collection("candidates").document(candidate_id).collection("video_submissions").stream()
        candidate_submissions = []
        
        for doc in candidate_docs:
            submission_data = doc.to_dict()
            candidate_submissions.append({
                "id": doc.id,
                **submission_data
            })
        
        # If no submissions in candidate subcollection, check main collection
        if not candidate_submissions:
            main_docs = db.collection("video_submissions").where("candidate_id", "==", candidate_id).stream()
            for doc in main_docs:
                submission_data = doc.to_dict()
                candidate_submissions.append({
                    "id": doc.id,
                    **submission_data
                })
        
        return {
            "candidate_id": candidate_id,
            "submissions": candidate_submissions,
            "total_submissions": len(candidate_submissions)
        }
        
    except Exception as e:
        logger.error(f"Error fetching submissions for candidate {candidate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch submissions")

# GET all candidate videos for admin dashboard
@router.get("/admin/all-video-submissions")
async def get_all_video_submissions():
    try:
        docs = db.collection("video_submissions").stream()
        all_submissions = []
        
        for doc in docs:
            submission_data = doc.to_dict()
            all_submissions.append({
                "id": doc.id,
                **submission_data
            })
        
        # Group by candidate for better organization
        candidates_with_videos = {}
        for submission in all_submissions:
            candidate_id = submission.get("candidate_id")
            if candidate_id not in candidates_with_videos:
                candidates_with_videos[candidate_id] = []
            candidates_with_videos[candidate_id].append(submission)
        
        return {
            "total_submissions": len(all_submissions),
            "total_candidates": len(candidates_with_videos),
            "submissions_by_candidate": candidates_with_videos,
            "all_submissions": all_submissions
        }
        
    except Exception as e:
        logger.error(f"Error fetching all submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch all submissions")

# Health check endpoint
@router.get("/video-health")
async def health_check():
    return {"status": "healthy", "service": "video_recording"}



async def trigger_emotion_analysis(candidate_id: str, video_submission_id: str):
    """Trigger emotion analysis via internal API call"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://localhost:8000/api/v1/analyze-video-emotions",  # Adjust port if different
                json={
                    "candidate_id": candidate_id,
                    "video_submission_id": video_submission_id
                }
            )
            if response.status_code == 200:
                logger.info(f"Emotion analysis triggered successfully for candidate {candidate_id}")
            else:
                logger.error(f"Failed to trigger emotion analysis: {response.status_code} - {response.text}")
                
    except Exception as e:
        logger.error(f"Failed to trigger emotion analysis for {candidate_id}: {e}")