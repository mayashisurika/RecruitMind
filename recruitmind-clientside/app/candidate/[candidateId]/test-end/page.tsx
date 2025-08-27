"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface CandidateInfo {
  name: string;
  email: string;
}

export default function TestCompletePage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;

  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [emailRequested, setEmailRequested] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Token validation and candidate info fetch
  useEffect(() => {
    const initializePage = async () => {
      // Check token validity
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
          return;
        }

        // Fetch candidate information
        const response = await fetch(
          `http://localhost:8000/api/v1/candidates/${candidateId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCandidateInfo({
            name: data.name || 'Candidate',
            email: data.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching candidate info:', error);
        // Continue anyway with default info
        setCandidateInfo({
          name: 'Candidate',
          email: ''
        });
      }

      setLoading(false);
    };

    initializePage();
  }, [candidateId, router]);

  const handleEmailChoice = async (wantsEmail: boolean) => {
    setEmailRequested(wantsEmail);
    
    if (!wantsEmail) {
      // Direct redirect to home after 2 seconds
      setTimeout(() => {
        handleLogout();
      }, 2000);
      return;
    }

    // Send email request
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/request-results-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            candidate_id: candidateId,
            email: candidateInfo?.email || ''
          })
        }
      );

      if (response.ok) {
        setSubmitMessage("✅ Email request submitted successfully! Results will be sent within 24-48 hours.");
      } else {
        setSubmitMessage("⚠️ Email request submitted, but there may have been an issue. Please contact support if you don't receive results.");
      }
    } catch (error) {
      console.error('Error requesting email:', error);
      setSubmitMessage("⚠️ There was an issue with the email request. Please contact support for your results.");
    }

    setIsSubmitting(false);
    
    // Redirect after showing message
    setTimeout(() => {
      handleLogout();
    }, 4000);
  };

  const handleLogout = () => {
    // Clear token and redirect to home
    localStorage.removeItem("access_token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Congratulations Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Congratulations, {candidateInfo?.name}! 🎉
          </h1>
          
          <div className="text-lg text-gray-600 mb-8 leading-relaxed">
            <p className="mb-4">
              You have successfully completed the RecruitMind assessment including:
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  MBTI Personality Assessment
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Leadership Style Evaluation
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Video Interview Session
                </li>
              </ul>
            </div>
            <p className="text-gray-700">
              Your responses have been recorded and will be carefully reviewed by our HR team. 
              Thank you for taking the time to complete our comprehensive assessment process.
            </p>
          </div>

          {/* Email Results Option */}
          {emailRequested === null && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📧 Would you like your results emailed to you?
              </h2>
              <p className="text-gray-600 mb-6">
                We can send a summary of your assessment results to{' '}
                <span className="font-medium text-blue-600">
                  {candidateInfo?.email || 'your registered email'}
                </span>
                {' '}within 24-48 hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleEmailChoice(true)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  📨 Yes, Email My Results
                </button>
                <button
                  onClick={() => handleEmailChoice(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  🏠 No Thanks, Go to Home
                </button>
              </div>
            </div>
          )}

          {/* Email Processing State */}
          {emailRequested === true && isSubmitting && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                <span className="text-blue-700 font-medium">Submitting email request...</span>
              </div>
            </div>
          )}

          {/* Email Success/Error Message */}
          {emailRequested === true && !isSubmitting && submitMessage && (
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <p className="text-green-800 font-medium mb-2">{submitMessage}</p>
              <p className="text-green-600 text-sm">Redirecting to home page...</p>
            </div>
          )}

          {/* No Email Choice Message */}
          {emailRequested === false && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 font-medium mb-2">
                ✓ No problem! Thank you for completing the assessment.
              </p>
              <p className="text-gray-600 text-sm">Redirecting to home page...</p>
            </div>
          )}

          {/* Next Steps Information */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">
              What happens next?
            </h3>
            <div className="text-left space-y-2 text-indigo-700">
              <p className="flex items-start">
                <span className="text-indigo-500 mr-2 mt-1">1.</span>
                Our HR team will review your assessment results
              </p>
              <p className="flex items-start">
                <span className="text-indigo-500 mr-2 mt-1">2.</span>
                You may be contacted for further interviews if selected
              </p>
              <p className="flex items-start">
                <span className="text-indigo-500 mr-2 mt-1">3.</span>
                Results and feedback will be provided as requested
              </p>
            </div>
          </div>

          {/* Manual Home Button (fallback) */}
          {emailRequested !== null && !isSubmitting && (
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Return to Home Page →
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© 2024 RecruitMind - Professional Assessment Platform</p>
        </div>
      </div>
    </div>
  );
}