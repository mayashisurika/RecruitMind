'use client';
import Link from 'next/link';
import { FaFileAlt, FaQuestionCircle, FaUsers, FaUser, } from 'react-icons/fa';

export function AdminSidebar() {
  return (
    <div className="fixed left-10 top-1/2 z-50 -translate-y-1/2">
      <div className="bg-[#F19A04] rounded-xl flex flex-col items-center justify-center py-4 space-y-10 w-14 h-96">
        <Link href="/admin/reports" title="Reports">
          <FaFileAlt className="text-white text-3xl hover:scale-110 transition" />
        </Link>
        <Link href="/admin/questions" title="Questions">
          <FaQuestionCircle className="text-white text-3xl hover:scale-110 transition" />
        </Link>
        <Link href="/admin/list" title="Admins">
          <FaUsers className="text-white text-3xl hover:scale-110 transition" />
        </Link>
        <Link href="/admin/profile" title="Profile">
          <FaUser className="text-white text-3xl hover:scale-110 transition" />
        </Link>
      </div>
    </div>
  );
}




