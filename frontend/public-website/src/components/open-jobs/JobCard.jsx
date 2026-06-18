'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, DollarSign, Briefcase, Clock, Shield } from 'lucide-react';
import ApplicationForm from './ApplicationForm';

const BRAND = '#00d9a6';

function getAppliedIds() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('appliedJobs') || '[]');
  } catch {
    return [];
  }
}

export default function JobCard({ job, onApplied }) {
  const [showForm, setShowForm] = useState(false);
  const [applied, setApplied] = useState(() => getAppliedIds().includes(job._id));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const subtitle = [job.roleType, job.location].filter(Boolean).join(' · ');

  return (
    <>
      <article className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00d9a6]/30 transition-all duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-[#00d9a6] to-[#00b894]" />
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#007a5c] bg-[#00d9a6]/10 px-2.5 py-1 rounded-full mb-2">
                <Shield className="w-3 h-3" />
                Confidential
              </span>
              <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#007a5c] transition-colors">
                {job.title}
              </h3>
              {subtitle && <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {job.salary && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-semibold text-gray-800 truncate">{job.salary}</span>
              </div>
            )}
            {job.experience && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-semibold text-gray-800 truncate">{job.experience}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs col-span-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-semibold text-gray-800 truncate">{job.location}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4 leading-relaxed">{job.description}</p>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-auto">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDate(job.createdAt)}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/open-jobs/${job._id}`}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                View JD
              </Link>
              <button
                type="button"
                disabled={applied}
                onClick={() => !applied && setShowForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: applied ? '#94a3b8' : BRAND }}
              >
                {applied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </article>

      {showForm && (
        <ApplicationForm
          job={job}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            const ids = [...getAppliedIds(), job._id];
            localStorage.setItem('appliedJobs', JSON.stringify(ids));
            setApplied(true);
            setShowForm(false);
            onApplied?.();
          }}
        />
      )}
    </>
  );
}
