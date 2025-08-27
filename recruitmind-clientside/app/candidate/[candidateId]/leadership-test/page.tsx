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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Leadership Style Test</h1>

      {questions.map((q) => {
        const selectedIdx = answers.find((a) => a.questionId === q.id)
          ? q.styles.findIndex(
              (style) =>
                style === answers.find((a) => a.questionId === q.id)?.style
            )
          : -1;
        return (
          <QuestionCard
            key={q.id}
            question={q.text}
            options={q.options}
            selected={selectedIdx !== -1 ? String(selectedIdx) : ""}
            onSelect={(option: string, idx: number) => handleSelect(q.id, q.styles[idx], option)}
          />
        );
      })}

      {questions.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      )}
    </div>
  );
}
