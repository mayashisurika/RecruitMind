"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function TestConsentPage() {
  const router = useRouter();
  const params = useParams(); // gets all dynamic params
  const candidateId = params.candidateId as string;

  const [loading, setLoading] = useState(false);

  // --- Token expiration check and redirect ---
  // This effect checks the token once on mount and then every 30 seconds.
  // If the token is expired while the user is on the page, they are redirected to the home page automatically.
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
    checkToken(); // initial check on mount
    const interval = setInterval(checkToken, 30000); // check every 30 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, [router]);

  const handleConsent = async (agree: boolean) => {
    if (!agree) {
      alert("You must agree to proceed with the test.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/candidate/consent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidate_id: candidateId, consent: true }),
        }
      );

      if (res.ok) {
        router.push(`/candidate/${candidateId}/personality-test`);
      } else {
        alert("Failed to save consent. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-poppins py-8">
      <h1 className="text-2xl font-bold mb-4">Consent for the Personality Test and Video Recording</h1>
      <div className="mb-6 max-w-3xl w-full bg-white rounded-lg shadow p-6 my-4">
        <p className="text-center font-medium mb-4">
          By continuing, you confirm that you have read, understood, and voluntarily agree to the following:
        </p>
        <ul className="space-y-4 text-gray-700">
          <li>
        <span className="font-semibold">Purpose of the Test:</span>
        <ul className="list-disc ml-6">
          <li>This system uses artificial intelligence (AI) to analyze your responses to interview questions.</li>
          <li>Your recorded video and answers will be used solely for personality assessment and research/organizational decision-making purposes.</li>
        </ul>
          </li>
          <li>
        <span className="font-semibold">Video Recording:</span>
        <ul className="list-disc ml-6">
          <li>Your interview will be recorded (audio and video).</li>
          <li>These recordings will be securely stored and accessed only by authorized personnel.</li>
        </ul>
          </li>
          <li>
        <span className="font-semibold">Confidentiality & Data Protection:</span>
        <ul className="list-disc ml-6">
          <li>All personal data, recordings, and test results will be treated as strictly confidential.</li>
          <li>Your data will not be shared with third parties without your explicit permission.</li>
          <li>Data will be stored in compliance with applicable data protection and privacy laws.</li>
        </ul>
          </li>
          <li>
        <span className="font-semibold">Voluntary Participation:</span>
        <ul className="list-disc ml-6">
          <li>Your participation is entirely voluntary.</li>
          <li>You may choose to withdraw from the test at any time without penalty.</li>
        </ul>
          </li>
          <li>
        <span className="font-semibold">Ethical Considerations:</span>
        <ul className="list-disc ml-6">
          <li>The system is designed to ensure fairness, respect, and non-discrimination.</li>
          <li>AI-based analysis may have limitations; results will not be the sole basis for employment decisions.</li>
          <li>Your dignity and privacy will be respected throughout the process.</li>
        </ul>
          </li>
          <li>
        <span className="font-semibold">Consent:</span>
         <br />By clicking “I Agree”, you acknowledge that you:
        <ul className="list-disc ml-6">
          <li>Understand the purpose and process of the personality analysis.</li>
          <li>Consent to your interview being recorded and analyzed.</li>
          <li>Agree to the ethical use of your data as described above.</li>
        </ul>
          </li>
        </ul>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => handleConsent(true)}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 active:scale-95 transform transition"
          disabled={loading}
        >
          I Agree
        </button>
        <button
          onClick={() => handleConsent(false)}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 active:scale-95 transform transition"
          disabled={loading}
        >
          I Do Not Agree
        </button>
      </div>
    </div>
  );
}
