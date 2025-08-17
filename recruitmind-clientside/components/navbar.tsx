'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#F4EAE2] text-[#0C2F37] font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="RecruitMind Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold font-poppins">RecruitMind</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 font-medium text-sm text-center items-center">
            <Link href="/" className="hover:text-accent1 transition">Home</Link>
            <Link href="/candidate/candidate-login" className="hover:text-accent1 transition">Start Test</Link>
            <Link href="/admin/admin-login" className="bg-[#0C2F37] text-white px-4 py-2 rounded-full text-sm hover:bg-opacity-90 transition">Admin Login</Link>          
          </div>

          {/* Mobile menu toggle
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div> */}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-sm">
          <Link href="/" className="block hover:text-accent1">Home</Link>
          <Link href="/start" className="block hover:text-accent1">Start Test</Link>
          <Link href="/admin/login" className="block hover:text-accent1">Admin</Link>
          <Link href="/contact" className="block hover:text-accent1">Contact</Link>
        </div>
      )}
    </nav>
  );
}
