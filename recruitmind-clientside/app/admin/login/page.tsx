'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/auth/request-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to request OTP');
      setOtpRequested(true);
      setSuccess(data.message || 'OTP sent to your email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/auth/verify-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to verify OTP');
      setSuccess('Login successful!');
      // Save token if needed: localStorage.setItem('token', data.access_token);
      // Redirect to admin dashboard using Next.js router
      router.push('/admin/admin-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4EAE2] flex items-center justify-center m-15 font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Gradient Background with Login */}
        <div className="flex-1 bg-gray-900 m-5 rounded-2xl flex flex-col justify-center items-center text-white relative overflow-hidden">    
          <img
            src="/image5.png"
            alt="Login illustration"
            className="w-full h-full object-cover rounded-2xl opacity-50"
          />
        </div>
        {/* Right Side - Admin Login Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center ">Admin Login</h1>
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-600 text-center">{success}</div>}
            <div className="space-y-6">
              {!otpRequested ? (
                <form onSubmit={handleRequestOtp}>
                  <div>
                    {/* <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label> */}
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 mb-6 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your admin email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8fbf6b] to-[#cfdf6f] text-white py-3 rounded-full font-medium hover:from-[#cfdf6f] hover:to-[#8fbf6b] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 transition-transform duration-200"
                  >
                    {loading ? 'Sending OTP...' : 'Request OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      OTP Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter the 6-digit OTP"
                      required
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8fbf6b] to-[#cfdf6f] text-white py-3 rounded-full font-medium hover:from-[#cfdf6f] hover:to-[#8fbf6b] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 transition-transform duration-200"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Login'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}