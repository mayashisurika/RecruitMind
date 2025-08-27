import cv2  # OpenCV for video processing
import numpy as np
from deepface import DeepFace  # DeepFace for emotion analysis
import tempfile  # For creating temporary files
import os
import requests  # For downloading video from URL
from typing import Dict, List, Optional

class VideoEmotionAnalyzer:
    """
    Professional emotion analyzer for RecruitMind video interviews
    Focus on high-confidence detections with practical insights
    """

    def __init__(self, confidence_threshold: float = 0.7):
        # Initialize with a confidence threshold for emotion detection
        self.confidence_threshold = confidence_threshold

    def download_video_from_url(self, video_url: str) -> Optional[str]:
        """
        Download video from a given URL and save it as a temporary file.
        Returns the path to the temporary file, or None if download fails.
        """
        try:
            print(f"Downloading video from: {video_url}")
            # Make a GET request to download the video
            response = requests.get(video_url, stream=True, timeout=60)
            response.raise_for_status()

            # Create a temporary file to store the video
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')

            # Write the video content in chunks to the temp file
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)

            temp_file.close()
            print(f"Video downloaded to: {temp_file.name}")
            return temp_file.name

        except Exception as e:
            print(f"Error downloading video: {e}")
            return None

    def analyze_video_emotions(self, video_path: str) -> Dict:
        """
        Analyze emotions in a video file using DeepFace.
        Returns a professional analysis report as a dictionary.
        """
        print(f"Starting emotion analysis for: {video_path}")

        # Open the video file for reading frames
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            # If video cannot be opened, return error status
            return {
                "status": "error",
                "message": "Could not open video file",
                "analysis": None
            }

        # Get video properties: frames per second, total frames, duration
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        print(f"Video info: {duration:.1f}s, {total_frames} frames, {fps} fps")

        # Skip frames for efficiency (process every ~1 second)
        frame_skip = max(fps, 30)

        emotion_counts = {}  # Dictionary to count detected emotions
        successful_detections = 0  # Number of high-confidence detections
        frame_count = 0  # Total frames read
        processed_frames = 0  # Frames actually analyzed

        while True:
            ret, frame = cap.read()
            if not ret:
                break  # End of video

            frame_count += 1

            # Skip frames for efficiency (analyze every frame_skip-th frame)
            if frame_count % frame_skip != 0:
                continue

            processed_frames += 1
            timestamp = frame_count / fps

            try:
                # Analyze the current frame for emotions
                result = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )

                if result and len(result) > 0:
                    emotion_data = result[0]['emotion']  # Dict of emotion scores
                    dominant_emotion = result[0]['dominant_emotion']  # Most likely emotion

                    # Get confidence score (DeepFace returns percentages)
                    confidence = emotion_data.get(dominant_emotion, 0) / 100.0

                    # Only count high-confidence detections
                    if confidence >= self.confidence_threshold:
                        emotion_counts[dominant_emotion] = emotion_counts.get(dominant_emotion, 0) + 1
                        successful_detections += 1
                        print(f"  {timestamp:.1f}s: {dominant_emotion} ({confidence:.2f})")

            except Exception as e:
                # Continue processing on individual frame errors
                continue

        cap.release()

        print(f"Analysis complete: {processed_frames} frames processed, {successful_detections} reliable detections")

        # Generate and return the final analysis report
        return self._create_analysis_report(
            emotion_counts,
            successful_detections,
            duration,
            processed_frames
        )
    
    def _create_analysis_report(self, emotion_counts: Dict, total_detections: int, 
                              duration: float, processed_frames: int) -> Dict:
        """Generate professional emotion analysis report"""
        
        # Handle case with no reliable detections
        if total_detections == 0:
            return {
                "status": "limited_data",
                "message": "No high-confidence emotional expressions detected",
                "duration": duration,
                "processed_frames": processed_frames,
                "analysis": {
                    "dominant_emotion": "undetected",
                    "emotion_breakdown": {},
                    "insights": [
                        "Video quality or lighting may have limited emotion detection",
                        "Consider improving lighting conditions for future recordings"
                    ],
                    "confidence_level": "low"
                }
            }
        
        # Calculate emotion percentages
        emotion_percentages = {
            emotion: round((count / total_detections) * 100, 1) 
            for emotion, count in emotion_counts.items()
        }
        
        # Sort emotions by frequency
        sorted_emotions = sorted(emotion_percentages.items(), key=lambda x: x[1], reverse=True)
        dominant_emotion = sorted_emotions[0][0] if sorted_emotions else "neutral"
        
        # Generate professional insights
        insights = self._generate_professional_insights(emotion_percentages, dominant_emotion)
        
        # Determine confidence level
        confidence_level = self._assess_confidence_level(total_detections, duration)
        
        return {
            "status": "success",
            "message": f"Emotion analysis completed with {total_detections} reliable detections",
            "duration": duration,
            "processed_frames": processed_frames,
            "analysis": {
                "dominant_emotion": dominant_emotion,
                "emotion_breakdown": dict(sorted_emotions),
                "insights": insights,
                "confidence_level": confidence_level,
                "detection_rate": round((total_detections / processed_frames) * 100, 1) if processed_frames > 0 else 0
            }
        }
    
    def _generate_professional_insights(self, emotions: Dict, dominant: str) -> List[str]:
        """Generate professional HR-focused insights"""
        insights = []
        
        # Categorize emotions
        positive_emotions = ['happy', 'surprise']
        neutral_emotions = ['neutral']
        stress_emotions = ['fear', 'sad', 'angry', 'disgust']
        
        positive_score = sum(emotions.get(e, 0) for e in positive_emotions)
        neutral_score = sum(emotions.get(e, 0) for e in neutral_emotions)
        stress_score = sum(emotions.get(e, 0) for e in stress_emotions)
        
        # Professional insights based on emotional patterns
        if positive_score >= 30:
            insights.append("Candidate demonstrates positive engagement and enthusiasm")
        
        if neutral_score >= 50:
            insights.append("Maintains professional composure throughout the interview")
        
        if stress_score >= 25:
            insights.append("Some indicators of interview stress or discomfort detected")
        
        # Specific dominant emotion insights for HR context
        dominant_insights = {
            'happy': "Shows enthusiasm and positive attitude towards questions",
            'neutral': "Professional and composed demeanor maintained consistently", 
            'surprise': "Demonstrates engagement and interest in interview topics",
            'fear': "May indicate nervousness or uncertainty about responses",
            'sad': "Could suggest low confidence or disappointment with performance",
            'angry': "Possible frustration or disagreement with certain topics",
            'disgust': "May indicate negative reaction to specific questions"
        }
        
        if dominant in dominant_insights:
            insights.append(dominant_insights[dominant])
        
        # Add general assessment
        if len(insights) == 0:
            insights.append("Candidate showed varied emotional responses throughout interview")
            
        return insights
    
    def _assess_confidence_level(self, detections: int, duration: float) -> str:
        """Assess overall confidence in the analysis"""
        detection_density = detections / duration if duration > 0 else 0
        
        if detection_density >= 0.5 and detections >= 10:
            return "high"
        elif detection_density >= 0.2 and detections >= 5:
            return "medium"
        else:
            return "low"
    
    def cleanup_temp_file(self, file_path: str):
        """Clean up temporary video file"""
        try:
            if file_path and os.path.exists(file_path):
                os.unlink(file_path)
                print(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            print(f"Error cleaning up file {file_path}: {e}")


def analyze_video_from_url(video_url: str, confidence_threshold: float = 0.7) -> Dict:
    """
    Convenience function to analyze video directly from URL
    Main entry point for the emotion analysis service
    """
    analyzer = VideoEmotionAnalyzer(confidence_threshold)
    
    # Download video
    temp_video_path = analyzer.download_video_from_url(video_url)
    
    if not temp_video_path:
        return {
            "status": "error",
            "message": "Failed to download video from URL",
            "analysis": None
        }
    
    try:
        # Analyze emotions
        result = analyzer.analyze_video_emotions(temp_video_path)
        return result
        
    finally:
        # Always clean up
        analyzer.cleanup_temp_file(temp_video_path)


# Test function for development
# if __name__ == "__main__":
#     # Test with a video URL
#     test_video_url = "https://your-test-video-url.mp4"
#     result = analyze_video_from_url(test_video_url)
    
#     print("\n=== EMOTION ANALYSIS RESULT ===")
#     print(f"Status: {result['status']}")
#     print(f"Message: {result['message']}")
    
#     if result['status'] == 'success':
#         analysis = result['analysis']
#         print(f"\nDominant Emotion: {analysis['dominant_emotion']}")
#         print(f"Confidence Level: {analysis['confidence_level']}")
#         print(f"Detection Rate: {analysis['detection_rate']}%")
        
#         print("\nEmotion Breakdown:")
#         for emotion, percentage in analysis['emotion_breakdown'].items():
#             print(f"  {emotion}: {percentage}%")
        
#         print("\nProfessional Insights:")
#         for insight in analysis['insights']:
#             print(f"  • {insight}")