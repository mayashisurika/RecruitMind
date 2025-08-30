"use client";

import { useEffect, useState } from "react";
import AddAdminForm from "@/components/admin-list/add-admin-form";
import AdminTable from "@/components/admin-list/admin-table";
import SearchFilter from "@/components/admin-candidates/search-filter";

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminListPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/admins");
      const data = await res.json();
      const adminsArray = Array.isArray(data)
        ? data
        : Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setAdmins(adminsArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleFilterChange = (filters: { search: string; startDate: string; endDate: string }) => {
    setSearch(filters.search);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
  };

  const filteredAdmins = admins.filter((a) => {
    const adminName = a.name || "";
    const adminEmail = a.email || "";
    const matchesSearch =
      adminName.toLowerCase().includes(search.toLowerCase()) ||
      adminEmail.toLowerCase().includes(search.toLowerCase());
    const withinDate =
      (!startDate || new Date(a.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(a.createdAt) <= new Date(endDate));
    return matchesSearch && withinDate;
  });

  return (
    <section className="min-h-screen bg-[#F4EAE2] from-slate-50 to-slate-100 font-poppins">
      {/* Header Section */}
      <div className="bg-gradient-to-l from-[#47684C] via-[#38533B] to-[#2A3E2C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Admin Management</h1>
              <p className="text-teal-100 text-lg font-medium">
                Empowering Better Decisions Through Deeper Understanding
              </p>
              <p className="text-teal-200 mt-2">
                Manage and track all admins in your system
              </p>
            </div>
            <div className="hidden lg:block -ml-8">
              <img
                src="/admin-page.png"
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

        {/* Admins Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0C2F37]">Admin Directory</h2>
              <p className="text-slate-600 text-sm mt-1">
                {loading ? "Loading..." : `Showing ${filteredAdmins.length} admins`}
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
                <span>Add Admin</span>
              </button>
            )}
          </div>
          <div className="p-6">
            <AdminTable admins={filteredAdmins} loading={loading} />
          </div>
        </div>

        {/* Add Admin Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-[#F19A04]">Add New Admin</h2>
              <p className="text-slate-600 text-sm mt-1">Fill in the admin details below</p>
            </div>
            <div className="p-6">
              <AddAdminForm
                onAdd={() => {
                  fetchAdmins();
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
            Empowering admin management with RecruitMind
          </p>
        </div>
      </div>
    </section>
  );
}
