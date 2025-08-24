"use client";

interface SearchFilterProps {
  search: string;
  startDate: string;
  endDate: string;
  onFilterChange: (filters: { search: string; startDate: string; endDate: string }) => void;
}

export default function SearchFilter({ search, startDate, endDate, onFilterChange }: SearchFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Search Input */}
      <div className="md:col-span-1">
        <label className="block text-sm font-semibold text-[#0C2F37] mb-2">
          Search Candidates
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onFilterChange({ search: e.target.value, startDate, endDate })}
            className="w-full pl-10 pr-4 py-3 border border-[#0C2F37] rounded-xl focus:ring-2 focus:ring-[teal-500] focus:border-teal-500 transition-all duration-200 bg-slate-50 hover:bg-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Start Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onFilterChange({ search, startDate: e.target.value, endDate })}
            className="w-full pl-10 pr-4 py-3 border border-[#0C2F37] rounded-xl focus:ring-2 focus:ring-[#0C2F37] focus:border-[#0C2F37] transition-all duration-200 bg-slate-50 hover:bg-white"
            title="Filter candidates from this date"
          />
        </div>
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          End Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onFilterChange({ search, startDate, endDate: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-[#0C2F37] rounded-xl focus:ring-2 focus:ring-[#0C2F37] focus:border-[#0C2F37] transition-all duration-200 bg-slate-50 hover:bg-white"
            title="Filter candidates until this date"
          />
        </div>
      </div>
    </div>
  );
}
