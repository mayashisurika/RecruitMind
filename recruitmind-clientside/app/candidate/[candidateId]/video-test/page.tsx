"use client";

import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface VideoSession {
  session_id: string;
  questions: string[];
}

type RecordingState = 'idle' | 'recording' | 'stopped' | 'uploading' | 'completed';

export default function VideoTestPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;

  // Session and questions state
  const [sessionData, setSessionData] = useState<VideoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Token validation
  useEffect(() => {
    const checkToken = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.push("/");
        return false;
      }
      
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (Date.now() / 1000 > decoded.exp) {
          localStorage.removeItem("access_token");
          router.push("/");
          return false;
        }
        return true;
      } catch {
        router.push("/");
        return false;
      }
    };

    if (!checkToken()) return;

    const interval = setInterval(() => {
      checkToken();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  // Initialize camera and fetch questions
  useEffect(() => {
    const initializeVideoTest = async () => {
      try {
        setLoading(true);
        
        // Fetch video questions and create session
        const response = await fetch(
          `http://localhost:8000/api/v1/video-questions?candidate_id=${candidateId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        setSessionData({
          session_id: data.session_id,
          questions: data.questions
        });

        // Initialize camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Force video to play and show preview
          try {
            await videoRef.current.play();
            console.log('Video preview started successfully');
          } catch (playError) {
            console.warn('Video autoplay failed:', playError);
            // User might need to interact with page first
          }
        }

        // Setup MediaRecorder with better browser compatibility
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
            ? 'video/webm;codecs=vp8'
            : MediaRecorder.isTypeSupported('video/mp4')
            ? 'video/mp4'
            : 'video/webm'
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
            console.log('Video chunk recorded:', event.data.size, 'bytes');
          }
        };

        recorder.onstop = () => {
          console.log('Recording stopped, creating blob from', chunksRef.current.length, 'chunks');
          const blob = new Blob(chunksRef.current, { 
            type: recorder.mimeType || 'video/webm' 
          });
          console.log('Video blob created:', blob.size, 'bytes, type:', blob.type);
          setVideoBlob(blob);
          chunksRef.current = [];
          setRecordingState('stopped');
        };

        recorder.onstart = () => {
          console.log('Recording started with mimeType:', recorder.mimeType);
        };

        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          setError('Recording failed. Please try again.');
        };

        setMediaRecorder(recorder);
        setLoading(false);
        
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize camera or fetch questions. Please check permissions.');
        setLoading(false);
      }
    };

    initializeVideoTest();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [candidateId]);

  const testCameraPreview = async () => {
    if (videoRef.current && streamRef.current) {
      try {
        // Force refresh the video element
        videoRef.current.srcObject = null;
        await new Promise(resolve => setTimeout(resolve, 100));
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        console.log('Camera preview refreshed successfully');
      } catch (error) {
        console.error('Camera preview test failed:', error);
        setError('Camera preview issue. Try refreshing the page.');
      }
    }
  };

  const startRecording = () => {
    if (!mediaRecorder || !sessionData) return;

    try {
      mediaRecorder.start(1000); // Record in 1-second chunks
      setRecordingState('recording');
      setRecordingStartTime(Date.now());
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            stopRecording(); // Auto-stop when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const submitVideo = async () => {
    if (!videoBlob || !sessionData || !recordingStartTime) {
      setError('No video to submit');
      return;
    }

    setRecordingState('uploading');
    setUploadProgress(0);

    try {
      const actualDuration = (Date.now() - recordingStartTime) / 1000;
      
      const formData = new FormData();
      formData.append('candidate_id', candidateId);
      formData.append('session_id', sessionData.session_id);
      formData.append('duration_seconds', actualDuration.toString());
      formData.append('video', videoBlob, `candidate_${candidateId}_interview.webm`);

      // Simulate upload progress (you can implement real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('http://localhost:8000/api/v1/video-submission', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to submit video');
      }

      const result = await response.json();
      console.log('Video submitted successfully:', result);
      
      setRecordingState('completed');
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push(`/candidate/${candidateId}/test-end`);
      }, 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setRecordingState('stopped');
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 120) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Initializing camera and loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Video Interview
          </h1>
          <p className="text-gray-600">
            Answer both questions in a single 5-minute recording session
          </p>
        </div>

        {/* Timer */}
        <div className={`text-2xl font-mono font-bold text-center mb-6 ${getTimerColor()}`}>
          Time Remaining: {formatTime(timeLeft)}
          {timeLeft <= 60 && timeLeft > 0 && (
            <span className="text-sm block mt-1 text-red-500">
              ⚠️ Less than 1 minute remaining!
            </span>
          )}
        </div>

        {/* Questions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Please answer these questions:
          </h2>
          <div className="space-y-4">
            {sessionData.questions.map((question, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
              >
                <span className="font-semibold text-blue-700">
                  Question {index + 1}:
                </span>
                <p className="mt-1 text-gray-800">{question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Preview */}
        <div className="mb-6">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-md mx-auto border rounded-lg shadow-sm bg-black"
            />
            {/* Camera status overlay */}
            <div className="absolute top-2 left-2 z-10">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                streamRef.current 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {streamRef.current ? '🔴 Camera Active' : '⚫ Camera Inactive'}
              </div>
            </div>
            {/* Recording indicator */}
            {recordingState === 'recording' && (
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                  REC
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Live camera preview - You should see yourself here
          </p>
        </div>

        {/* Recording Status */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            recordingState === 'recording' 
              ? 'bg-red-100 text-red-800' 
              : recordingState === 'stopped'
              ? 'bg-green-100 text-green-800'
              : recordingState === 'uploading'
              ? 'bg-blue-100 text-blue-800'
              : recordingState === 'completed'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {recordingState === 'recording' && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Recording...
              </>
            )}
            {recordingState === 'stopped' && '✓ Recording Complete'}
            {recordingState === 'uploading' && (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Uploading... {uploadProgress}%
              </>
            )}
            {recordingState === 'completed' && '✅ Video Submitted Successfully!'}
            {recordingState === 'idle' && 'Ready to Record'}
          </div>
        </div>

        {/* Upload Progress */}
        {recordingState === 'uploading' && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {recordingState === 'idle' && (
            <div className="flex flex-col items-center space-y-2">
              {/* Camera test button */}
              <button
                onClick={testCameraPreview}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                🔧 Test Camera Preview
              </button>
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🎥 Start Recording
              </button>
            </div>
          )}
          
          {recordingState === 'recording' && (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              ⏹️ Stop Recording
            </button>
          )}
          
          {recordingState === 'stopped' && (
            <div className="space-x-4">
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                🔄 Re-record
              </button>
              <button
                onClick={submitVideo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📤 Submit Video
              </button>
            </div>
          )}
          
          {recordingState === 'completed' && (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">
                Thank you! Redirecting...
              </p>
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You have 5 minutes total to answer both questions</li>
            <li>• Record in one continuous session</li>
            <li>• You can stop and re-record if needed</li>
            <li>• Video will auto-submit when time expires</li>
            <li>• Ensure good lighting and clear audio</li>
            <li>• If you see a black screen, click "Test Camera Preview"</li>
          </ul>
          
          {/* Troubleshooting info */}
          <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">Camera Troubleshooting:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• If video shows black screen but recording works, this is just a preview issue</li>
              <li>• Your recording will still capture properly even with black preview</li>
              <li>• Try clicking "Test Camera Preview" to refresh the view</li>
              <li>• Check browser permissions for camera access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}