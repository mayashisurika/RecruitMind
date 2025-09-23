"use client";

import { useEffect, useState } from "react";
import AddCandidateForm from "@/components/admin-candidates/add-candidate-form";
import CandidateTable from "@/components/admin-candidates/candidate-table";
import SearchFilter from "@/components/admin-candidates/search-filter";


interface Candidate {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false); // <-- new toggle state

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/candidates");
      const data = await res.json();

      const candidatesArray = Array.isArray(data)
        ? data
        : Object.keys(data).map((key) => ({ id: key, ...data[key] }));

      setCandidates(candidatesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleFilterChange = (filters: { search: string; startDate: string; endDate: string }) => {
    setSearch(filters.search);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
  };

  const filteredCandidates = candidates.filter((c) => {
    const candidateName = c.name || "";
    const candidateEmail = c.email || "";

    const matchesSearch =
      candidateName.toLowerCase().includes(search.toLowerCase()) ||
      candidateEmail.toLowerCase().includes(search.toLowerCase());

    const withinDate =
      (!startDate || new Date(c.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(c.createdAt) <= new Date(endDate));

    return matchesSearch && withinDate;
  });

  return (
    <section className="min-h-screen bg-[#F4EAE2] from-slate-50 to-slate-100 font-poppins">
      {/* Header Section */}
      <div className="bg-gradient-to-l from-[#47684C] via-[#38533B] to-[#2A3E2C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                Candidate Management
              </h1>
              <p className="text-teal-100 text-lg font-medium">
                Empowering Better Decisions Through Deeper Understanding
              </p>
              <p className="text-teal-200 mt-2">
                Manage and track all candidates in your recruitment pipeline
              </p>
            </div>
            <div className="hidden lg:block -ml-8">
              <img
              src="/candidate-page.png"
              alt="Decorative"
              className="w-40 h-40 object-contain rounded-full shadow-lg"
              />
            </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Search and Filter Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-[#0C2F37]">Search & Filter</h2>
          </div>
          <div className="p-6">
            <SearchFilter
              search={search}
              startDate={startDate}
              endDate={endDate}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Stats Cards
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">{candidates.length}</p>
                <p className="text-slate-600">Total Candidates</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">{filteredCandidates.length}</p>
                <p className="text-slate-600">Filtered Results</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">
                  {candidates.filter(c => new Date(c.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-slate-600">This Week</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Candidates Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0C2F37]">Candidate Directory</h2>
              <p className="text-slate-600 text-sm mt-1">
                {loading ? "Loading..." : `Showing ${filteredCandidates.length} candidates`}
              </p>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#F19A04] hover:from-[#F19A04] hover:to-[#F19A04] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Candidate</span>
              </button>
            )}
          </div>
          
          <div className="p-6">
            <CandidateTable candidates={filteredCandidates} loading={loading} />
          </div>
        </div>

        {/* Add Candidate Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-[#F19A04]">Add New Candidate</h2>
              <p className="text-slate-600 text-sm mt-1">Fill in the candidate details below</p>
            </div>
            
            <div className="p-6">
              <AddCandidateForm
                onAdd={() => {
                  fetchCandidates();
                  setShowForm(false);
                }}
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-slate-500">
            Empowering recruitment decisions with RecruitMind
          </p>
        </div>
      </div>
    </section>
  );
}
