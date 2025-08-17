from deepface import DeepFace
import cv2

# Load video file
video_path = '/video/final.mp4'  # Change this to your video name/path
cap = cv2.VideoCapture(video_path)

frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1

    # Process every 10th frame to save time
    if frame_count % 10 == 0:
        try:
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            emotion = result[0]['dominant_emotion']
            print(f"Frame {frame_count}: {emotion}")
            
            # Show video with emotion text
            cv2.putText(frame, f"Emotion: {emotion}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
        except Exception as e:
            print(f"Frame {frame_count}: Error -", e)

    # Show frame
    cv2.imshow('Facial Expression Recognition', frame)

    # Press 'q' to quit early
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release everything
cap.release()
cv2.destroyAllWindows()
