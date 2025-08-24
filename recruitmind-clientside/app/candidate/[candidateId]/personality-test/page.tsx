"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MBTIQuestion {
  id: string;
  question: string;
}

export default function PersonalityTestPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;

  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const likertOptions = [
    { label: "Strongly Disagree", value: "1" },
    { label: "Disagree", value: "2" },
    { label: "Neutral", value: "3" },
    { label: "Agree", value: "4" },
    { label: "Strongly Agree", value: "5" },
  ];

  // Fetch MBTI questions from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/mbti/questions?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) setQuestions(data.questions);
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  const handleAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/mbti/submit?candidate_id=${candidateId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );

      if (res.ok) {
        router.push(`/candidate/${candidateId}/video-test`);
      } else {
        const errorData = await res.json();
        alert("Failed to submit: " + errorData.detail);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length
    ? (Object.keys(answers).length / questions.length) * 100
    : 0;

  return (
      <div className="min-h-screen bg-radial from-[#C79D7C] via-[#CEA98B] to-[#F4EAE2] font-poppins relative overflow-hidden">
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
              Personality Test
            </h1>
            <p className="text-gray-600">
            Discover your unique personality type through {questions.length} carefully crafted questions
            </p>
            <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-5 mt-4 shadow-inner border border-white/40">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-5 rounded-full transition-all shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
            </div>
          <p className="text-sm text-gray-600 mt-1 font-medium">{Object.keys(answers).length} / {questions.length}</p>
        </div>

        {questions.map((q, index) => (
          <div
            key={q.id}
            className="mb-6 p-6 rounded-xl shadow-xl bg-[#1A646B] backdrop-blur-lg border border-white/60 hover:bg-white/90 transition-all duration-300"
          >
            <p className="font-semibold mb-4 text-white">
              {index + 1}. {q.question}
            </p>
            <div className="flex gap-3 justify-between flex-wrap">
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
                  <span className="text-xs text-center text-gray-700 font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 disabled:bg-gray-600 transition-all font-semibold"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
