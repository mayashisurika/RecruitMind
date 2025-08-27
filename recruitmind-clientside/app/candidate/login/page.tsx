'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function CandidateLogin() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handleRequestOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to request OTP");
      setStep("otp");
      setMessage("✅ OTP has been sent to your email.");
    } catch (err) {
      setMessage("❌ Failed to send OTP. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }), 
      });
      if (!res.ok) throw new Error("Invalid OTP");
      const data = await res.json();
  localStorage.setItem("access_token", data.access_token);

      // Decode JWT to get candidate id (sub)
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const candidateId = payload.sub;
      localStorage.setItem("candidateId", candidateId);

      setMessage("🎉 Login successful!");
      router.push(`/candidate/${candidateId}/test-consent`);
    } catch (err) {
      setMessage("❌ OTP verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="bg-[#F4EAE2] flex items-center justify-center min-h-screen font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Image */}
        <div className="flex-1 bg-gray-900 m-5 rounded-2xl flex justify-center items-center relative">
          <img
            src="/candidate-login.jpg"
            alt="Login illustration"
            className="w-full h-full object-cover rounded-2xl opacity-60"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Candidate Login</h1>

            {step === "email" && (
              <div className="space-y-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition"
                  placeholder="example@email.com"
                />
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#18aab8] to-[#2c52bf] text-white py-3 rounded-full font-medium hover:from-[#2c52bf] hover:to-[#18aab8] transform hover:scale-105 transition-all duration-300 shadow-lg active:scale-95"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-5">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition"
                  placeholder="Enter 6-digit OTP"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#18aab8] to-[#2c52bf] text-white py-3 rounded-full font-medium hover:from-[#2c52bf] hover:to-[#18aab8] transform hover:scale-105 transition-all duration-300 shadow-lg active:scale-95"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
