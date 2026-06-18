'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/open-jobs/ApplicationForm';
import JobDetailContent, { BRAND } from '@/components/open-jobs/JobDetailContent';
import { fetchPublicJob } from '@/lib/jobsApi';

export default function OpenJobDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPublicJob(id)
      .then(setJob)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <Link
            href="/open-jobs"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#007a5c] mb-10 transition-colors"
          >
            ← All open positions
          </Link>

          {loading && <p className="text-gray-500 py-20 text-center">Loading role…</p>}

          {error && <p className="text-red-600 py-20 text-center">{error}</p>}

          {job && (
            <>
              <JobDetailContent job={job} />

              <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-500 max-w-md">
                  Ready to apply? Submit your resume below — client name stays confidential until you advance.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="shrink-0 px-8 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: BRAND }}
                >
                  Apply now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />

      {showForm && job && (
        <ApplicationForm job={job} onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
      )}
    </div>
  );
}
