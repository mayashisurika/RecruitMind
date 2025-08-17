// recruitmind-clientside/app/page.tsx
"use client";

import { useState } from "react";
import Questionnaire from "../../components/questionnaire";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (responses: string[]) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/mbti/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: responses.join(" ") }),
        }
      );

      const data = await res.json();
      setResult(data.mbti_type); // matches MBTIResponse schema
    } catch (err) {
      console.error(err);
      setResult("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        MBTI Personality Test
      </h1>

      {!result && !loading && <Questionnaire onSubmit={handleSubmit} />}

      {loading && <p className="text-center">Analyzing your responses...</p>}

      {result && (
        <div className="p-6 mt-6 bg-green-100 rounded-xl text-center shadow">
          <h2 className="text-xl font-semibold">Your MBTI Type:</h2>
          <p className="text-2xl font-bold mt-2">{result}</p>
          <button
            onClick={() => setResult(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retake Test
          </button>
        </div>
      )}
    </main>
  );
}
