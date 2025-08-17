// Update the import path below if the actual path is different
'use client';
import { AdminSidebar } from '@/components/admin-sidebar';
import { FaSearch, FaEye } from 'react-icons/fa';

export default function CandidateReportsPage() {
  return (
    <div className="relative min-h-screen">
      <AdminSidebar />
      <main className="pl-20">
        <section className="p-6 min-h-screen text-[#0C2F37]">
          {/* Page title */}
          <h1 className="text-2xl font-bold mb-6 text-center">Candidate Reports</h1>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center bg-white rounded-full shadow-sm px-4 py-2">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by name or email"
                className="flex-grow focus:outline-none bg-transparent text-sm"
              />
            </div>
          </div>

          {/* Table of candidates */}
          <div className="overflow-x-auto">
            <table className="w-7xl text-sm bg-white rounded-xl shadow-md item-center justify-center mx-auto">
              <thead>
                <tr className="bg-[#0C2F37] text-white">
                  <th className="py-3 px-4 text-left">Candidate ID</th>
                  <th className="py-3 px-4 text-left">NIC</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Replace this with dynamic rows */}
                {[
                  { cid: '25145', nic: '199952687438', date: '2025-05-20' },
                  { cid: '25648', nic: '199952687438', date: '2025-05-22' },
                  { cid: '25739', nic: '199952687438', date: '2025-05-23' },
                ].map((candidate, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{candidate.cid}</td>
                    <td className="py-3 px-4">{candidate.nic}</td>
                    <td className="py-3 px-4">{candidate.date}</td>
                    <td className="py-3 px-4 text-center">
                      <button className="bg-[#CB6A4B] hover:bg-opacity-90 text-white px-4 py-1 rounded-full text-xs flex items-center gap-1 mx-auto">
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
