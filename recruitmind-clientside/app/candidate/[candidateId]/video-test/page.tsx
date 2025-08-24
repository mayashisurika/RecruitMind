"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VideoTestPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;

  const [videoQuestions, setVideoQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Fetch video questions from backend
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/video-questions?candidate_id=${candidateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) setVideoQuestions(data.questions);
      })
      .catch(console.error);
  }, []);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          chunksRef.current = [];
          setVideoBlob(blob);
        };
        setMediaRecorder(recorder);
      })
      .catch((err) => console.error("Camera error:", err));
  }, []);

  const handleStart = () => {
    if (!mediaRecorder) return;
    mediaRecorder.start();
    setRecording(true);

    // Stop after 5 minutes max
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        setRecording(false);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const handleStop = () => {
    if (!mediaRecorder || mediaRecorder.state !== "recording") return;
    mediaRecorder.stop();
    setRecording(false);
  };

  const handleNextQuestion = async () => {
    if (!videoBlob) {
      alert("Please record your answer first!");
      return;
    }

    // Prepare FormData to send video
    const formData = new FormData();
    formData.append("candidate_id", candidateId);
    formData.append("question_index", currentQIndex.toString());
    formData.append("video", videoBlob, `q${currentQIndex + 1}.webm`);

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/video-answers`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Failed to save video");

      // Move to next question or finish
      if (currentQIndex < videoQuestions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setVideoBlob(null);
      } else {
        router.push(`/candidate/${candidateId}/mbti-complete`); // or final page
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save video. Try again.");
    }
  };

  if (!videoQuestions.length) return <p>Loading video questions...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Video Question {currentQIndex + 1}</h1>
      <p className="mb-4">{videoQuestions[currentQIndex]}</p>

      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full mb-4 border rounded-lg"
      ></video>

      {!recording && (
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-green-600 text-white rounded-lg mr-2"
        >
          Start Recording
        </button>
      )}
      {recording && (
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-red-600 text-white rounded-lg mr-2"
        >
          Stop Recording
        </button>
      )}
      {videoBlob && (
        <button
          onClick={handleNextQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Next Question
        </button>
      )}
    </div>
  );
}
