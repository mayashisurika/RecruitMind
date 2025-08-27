"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface MBTIQuestion {
  id: string;
  question: string;
  dimension: string;
  options: string[];
}

interface MBTIResult {
  success: boolean;
  candidate_id: string;
  mbti_type: string;
  confidence: string;
  ml_result: string;
  traditional_result: string;
  dimension_scores: {
    IE: number;
    NS: number;
    TF: number;
    JP: number;
  };
}

export default function PersonalityTestPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;

  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // FIXED: Use consistent Likert scale (numeric values for backend processing)
  const likertOptions = [
    { label: "Strongly Disagree", value: "1" },
    { label: "Disagree", value: "2" },
    { label: "Neutral", value: "3" },
    { label: "Agree", value: "4" },
    { label: "Strongly Agree", value: "5" },
  ];

  // --- Token expiration check and redirect ---
  useEffect(() => {
    const checkToken = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (Date.now() / 1000 > decoded.exp) {
          localStorage.removeItem("access_token");
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [router]);

  // Fetch MBTI questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/mbti/questions");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.questions && Array.isArray(data.questions)) {
          // Remove duplicates and ensure we have exactly 20 questions
          const uniqueQuestions: MBTIQuestion[] = [];
          const seen = new Set<string>();
          
          for (const q of data.questions) {
            if (!seen.has(q.id) && uniqueQuestions.length < 20) {
              uniqueQuestions.push({
                id: q.id,
                question: q.question,
                dimension: q.dimension || "Unknown",
                options: q.options || likertOptions.map(opt => opt.label)
              });
              seen.add(q.id);
            }
          }
          
          setQuestions(uniqueQuestions);
          console.log(`Loaded ${uniqueQuestions.length} questions`);
        } else {
          throw new Error("Invalid question data received");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please refresh the page.");
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setError(""); // Clear any previous errors
  };

  const handleSubmit = async () => {
    // Validation
    if (Object.keys(answers).length !== questions.length) {
      setError(`Please answer all questions. You've answered ${Object.keys(answers).length} out of ${questions.length} questions.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Submitting answers:", answers);
      
      // FIXED: Send numeric values directly (backend now handles both formats)
      const response = await fetch(
        `http://localhost:8000/api/v1/mbti/submit?candidate_id=${candidateId}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ answers }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result: MBTIResult = await response.json();
      console.log("MBTI Result:", result);

      if (result.success && result.mbti_type) {
        // Optional: Show result preview before proceeding
        // alert(`Assessment complete! Your personality type: ${result.mbti_type} (Confidence: ${result.confidence})`);
        
        // Proceed to next test
        router.push(`/candidate/${candidateId}/leadership-test`);
      } else {
        throw new Error("Invalid result received from server");
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(`Failed to submit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length
    ? (Object.keys(answers).length / questions.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79D7C] via-[#CEA98B] to-[#F4EAE2] font-poppins relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#00353A]/30 to-pink-400/10 rounded-full blur-3xl"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-[#00353A]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-[#00353A]/40 rotate-45 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-32 w-3 h-3 bg-[#00353A]/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-[#00353A]/30 rotate-12 animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-2xl mx-auto p-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#00353A] mb-2">
            Personality Assessment
          </h1>
          <p className="text-gray-600">
            Discover your unique personality type through {questions.length} carefully crafted questions
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-5 mt-4 shadow-inner border border-white/40">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-5 rounded-full transition-all shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {Object.keys(answers).length} / {questions.length} completed
          </p>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="mb-6 p-6 rounded-xl shadow-xl bg-white/80 backdrop-blur-lg border border-white/60 hover:bg-white/90 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="font-semibold text-[#00353A] flex-1">
                  {index + 1}. {q.question}
                </p>
                {/* <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-4">
                  {q.dimension}
                </span> */}
              </div>
              
              <div className="flex gap-2 justify-between flex-wrap">
                {likertOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col items-center flex-1 min-w-[80px] cursor-pointer p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      answers[q.id] === opt.value
                        ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                        : 'border-gray-200 bg-white/60 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => handleAnswer(q.id, opt.value)}
                      className="mb-2 accent-orange-400"
                    />
                    <span className="text-xs text-center text-gray-700 font-medium">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Submit Button */}
        {questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length !== questions.length}
            className={`mt-6 w-full px-6 py-4 rounded-lg font-semibold text-white transition-all ${
              loading || Object.keys(answers).length !== questions.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 hover:scale-105 shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing Assessment...
              </div>
            ) : (
              `Proceed... (${Object.keys(answers).length}/${questions.length})`
            )}
          </button>
        )}
      </div>
    </div>
  );
}