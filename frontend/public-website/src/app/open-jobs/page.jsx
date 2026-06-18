'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/open-jobs/JobCard';
import { fetchPublicJobs } from '@/lib/jobsApi';
import { Search, Briefcase } from 'lucide-react';

export default function OpenJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await fetchPublicJobs();
      setJobs(data);
      setFiltered(data);
    } catch (e) {
      setError(e.message || 'Failed to load jobs');
      setJobs([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(jobs);
      return;
    }
    setFiltered(
      jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.roleType?.toLowerCase().includes(q)
      )
    );
  }, [search, jobs]);

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6">
              <Briefcase className="w-4 h-4 text-[#00d9a6]" />
              Quore IT Open Roles
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Confidential tech opportunities
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Curated roles from leading companies. Client names remain confidential until you advance in the process.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, location, role type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full appearance-none rounded-full border-2 border-[#00d9a6]/50 bg-white py-4 pl-14 pr-5 text-base text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.25)] placeholder:text-gray-500 focus:border-[#00d9a6] focus:outline-none focus:ring-4 focus:ring-[#00d9a6]/20 [color-scheme:light]"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-12">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-700 mb-3">{error}</p>
              <button type="button" onClick={loadJobs} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">No open positions right now</p>
              <p className="text-gray-500 text-sm">Check back soon for new opportunities.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-6">{filtered.length} open {filtered.length === 1 ? 'role' : 'roles'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
