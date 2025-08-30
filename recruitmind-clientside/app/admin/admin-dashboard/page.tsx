'use client';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <section className="px-6 py-16 font-poppins">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-[#0C2F37] mb-12">
        DASHBOARD
      </h1>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-20 pt-10">
        
        {/* Card 1 - Candidate Reports */}
        <Link href="/admin/candidates">
          <div className="w-64 h-60 bg-[#47684C] rounded-xl shadow-md text-white flex flex-col items-center justify-center text-center p-4 hover:scale-105 transition">
            <h2 className="text-xl font-semibold mb-1">Candidate List</h2>
            <p className="text-sm">Add/View candidates along with generated personality reports</p>
          </div>
        </Link>

        {/* Card 2 - Change Questions */}
        <Link href="/admin/questions">
          <div className="w-64 h-60 bg-[#F19A04] rounded-xl shadow-md text-white flex flex-col items-center justify-center text-center p-4 hover:scale-105 transition">
            <h2 className="text-xl font-semibold mb-1">Change Question</h2>
            <p className="text-sm">Change questions of video-based questions according to requirements</p>
          </div>
        </Link>

        {/* Card 3 - Admin List */}
        <Link href="/admin/admin-list">
          <div className="w-64 h-60 bg-[#CB6A4B] rounded-xl shadow-md text-white flex flex-col items-center justify-center text-center p-4 hover:scale-105 transition">
            <h2 className="text-xl font-semibold mb-1">Admin List</h2>
            <p className="text-sm">Add and update authorized admins</p>
          </div>
        </Link>

      </div>
    </section>
  );
}
