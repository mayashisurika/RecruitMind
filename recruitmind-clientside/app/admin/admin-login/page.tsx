'use client';

import { useState } from 'react';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', { username, password, isLogin });
  };

  return (
    <div className="bg-[#F4EAE2] flex items-center justify-center m-15 font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Gradient Background with Login */}
        <div className="flex-1 bg-gray-900 m-5 rounded-2xl flex flex-col justify-center items-center text-white relative overflow-hidden">    
          {/* Image */}
          <img
            src="/image5.png"
            alt="Login illustration"
            className="w-full h-full object-cover rounded-2xl opacity-50"
          />
        </div>

        {/* Right Side - Create Account Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center ">Admin Login</h1>
           
            {/* Form */}
            <div className="space-y-6">
                <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
                  placeholder="Enter your username"
                />
                </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none transition-colors duration-300"
                  placeholder="Create a strong password"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#8fbf6b] to-[#cfdf6f] text-white py-3 rounded-full font-medium hover:from-[#cfdf6f] hover:to-[#8fbf6b] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 transition-transform duration-200"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}