"use client";

import React, { useState, useEffect } from "react";
import QuestionCard from "@/components/leadership-questioncard";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface Question {
  id: string;
  text: string;
  options: string[];
  styles: string[];
  section: string;
}

interface Answer {
  questionId: string;
  style: string;
  option: string;
}

export default function LeadershipTest() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params?.candidateId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  // Store answers as array of objects for backend compatibility
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch leadership questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/leadership/questions");
        const data = await res.json();
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error("Questions API did not return an array:", data);
          setQuestions([]);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setQuestions([]);
      }
    }
    fetchQuestions();
  }, []);

  // Track selected answer
  // When user selects an option, update the answers array
  const handleSelect = (id: string, style: string, option: string) => {
    setAnswers((prev) => {
      // Remove any previous answer for this question
      const filtered = prev.filter((a) => a.questionId !== id);
      return [...filtered, { questionId: id, style, option }];
    });
  };

  // Submit answers
  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      alert("Please answer all questions!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/leadership/result?candidateId=${candidateId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        }
      );

      if (response.ok) {
        router.push(`/candidate/${candidateId}/video-test`);
      } else {
        const errorData = await response.json();
        alert("Failed to submit: " + errorData.detail);
      }
    } catch (err) {
      console.error("Error submitting leadership test:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C79D7C] via-[#CEA98B] to-[#F4EAE2] font-poppins relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#00353A]/30 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-4 h-4 bg-[#00353A]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-[#00353A]/40 rotate-45 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-32 w-3 h-3 bg-[#00353A]/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-[#00353A]/30 rotate-12 animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="max-w-2xl mx-auto p-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#00353A] mb-2">Leadership Style Test</h1>
          <p className="text-gray-600">Discover your leadership style by answering all questions below</p>
        </div>
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : (
          questions.map((q, idx) => {
            const selectedIdx = answers.find((a) => a.questionId === q.id)
              ? q.styles.findIndex(
                  (style) => style === answers.find((a) => a.questionId === q.id)?.style
                )
              : -1;
            return (
              <div
                key={q.id}
              >
                {/* Remove duplicate question text here, only show QuestionCard */}
                <QuestionCard
                  question={`${idx + 1}. ${q.text}`}
                  options={q.options}
                  selected={selectedIdx !== -1 ? String(selectedIdx) : ""}
                  onSelect={(option: string, i: number) => handleSelect(q.id, q.styles[i], option)}
                />
              </div>
            );
          })
        )}
        {questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-6 w-full px-6 py-4 rounded-lg font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 hover:scale-105 shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
