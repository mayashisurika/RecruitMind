"use client";

import { useState } from "react";
import CandidateReport from "@/components/admin-candidates/candidate-report";

interface Candidate {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CandidateTableProps {
  candidates: Candidate[];
  loading: boolean;
}

export default function CandidateTable({ candidates, loading }: CandidateTableProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const handleViewReport = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleCloseReport = () => {
    setSelectedCandidateId(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <svg className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Loading candidates...</p>
        <p className="text-slate-500 text-sm mt-1">Please wait while we fetch the data</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-[#47684C]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                Created At
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => (
                <tr 
                  key={candidate.id} 
                  className={`hover:bg-slate-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#6b866e] rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{candidate.name}</p>
                        <p className="text-xs text-slate-500">Candidate</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-800">{candidate.email}</div>
                    <div className="text-xs text-slate-500">Primary contact</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-800">
                      {new Date(candidate.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(candidate.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        title="View Assessment Report" 
                        onClick={() => handleViewReport(candidate.id)}
                        className="text-[#6b866e] hover:text-teal-800 font-medium hover:bg-teal-50 px-3 py-1 rounded-lg transition-all duration-150 flex items-center space-x-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button type="button" title="Edit candidate" className="text-orange-600 hover:text-orange-800 font-medium hover:bg-orange-50 px-3 py-1 rounded-lg transition-all duration-150 flex items-center">
                        <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button type="button" title="Delete candidate" className="text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-150 flex items-center">
                        <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No candidates found</h3>
                    <p className="text-slate-500 text-center max-w-md">
                      There are no candidates matching your current search criteria. Try adjusting your filters or add a new candidate to get started.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {selectedCandidateId && (
        <CandidateReport 
          candidateId={selectedCandidateId}
          onClose={handleCloseReport}
        />
      )}
    </>
  );
}