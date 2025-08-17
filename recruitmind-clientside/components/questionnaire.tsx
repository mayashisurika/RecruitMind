"use client";

import { useState } from "react";
import { mbtiQuestions } from "../data/questions";

type Props = {
  onSubmit: (responses: string[]) => void;
};

export default function Questionnaire({ onSubmit }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(mbtiQuestions.length).fill(null));

  const handleChange = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert numeric answers into descriptive text (better for the RoBERTa model)
    const responseText = answers.map((val, i) => {
      const scale = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
      return `${mbtiQuestions[i]}: ${scale[(val ?? 3) - 1]}`;
    });

    onSubmit(responseText);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mbtiQuestions.map((q, i) => (
        <div key={i} className="p-4 bg-white rounded-2xl shadow">
          <p className="mb-3 font-medium">{q}</p>
          <div className="flex justify-between text-sm">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="flex flex-col items-center">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={num}
                  checked={answers[i] === num}
                  onChange={() => handleChange(i, num)}
                  className="mb-1"
                  required
                />
                {num}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
}
