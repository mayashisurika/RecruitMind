import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0C2F37] text-white px-6 py-8 mt-16 font-poppins">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 justify-center items-center">
        <div className="flex items-center space-x-4">
            <img src="/Footer.png" alt="Extra Icon" className="w-75 h-50" />
        </div>

        {/* Brand Section */}
        <div className="flex flex-col items-center space-x-2">
            <img src="/logo.png" alt="RecruitMind Logo" className="w-10 h-10" />
            <h2 className="text-xl font-semibold">RecruitMind</h2>
            {/* <p className="text-sm mt-2 text-gray-300">
            Helping candidates showcase their potential and supporting HR with smart hiring insights.
            </p> */}
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/start" className="hover:text-white">About Us</a></li>
            <li><a href="/admin/login" className="hover:text-white">Admin Login</a></li>
            <li><a href="/contact" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold mb-2">Connect</h3>
          <p className="text-sm text-gray-300">Email: support@recruitmind.com</p>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-5 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} RecruitMind. All rights reserved.
      </div>
    </footer>
  );
}
