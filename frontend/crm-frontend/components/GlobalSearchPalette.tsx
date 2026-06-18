'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, User, Loader2, X } from 'lucide-react';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Job } from '@ats-saas/shared';
import type { CandidateListItem } from '@/types';

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function GlobalSearchPalette() {
  const { open, setOpen } = useGlobalSearch();
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), 320);
  const canSearch = hasRole('admin') || hasRole('recruiter');

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const enabled = open && !!user && canSearch && debounced.length >= 2;

  const { data: jobs = [], isFetching: jobsLoading } = useQuery({
    queryKey: ['global-search', 'jobs', debounced],
    queryFn: async () => {
      const { data: envelope } = await api.jobs.list({ page: 1, limit: 8, search: debounced });
      const payload = envelope?.data as { items?: Job[] } | undefined;
      return (payload?.items ?? []) as Job[];
    },
    enabled,
    staleTime: 20_000,
  });

  const { data: candidates = [], isFetching: candLoading } = useQuery({
    queryKey: ['global-search', 'candidates', debounced],
    queryFn: async () => {
      const { data: envelope } = await api.candidates.list({ page: 1, limit: 8, search: debounced });
      const inner = envelope?.data as { items?: CandidateListItem[] } | undefined;
      return (inner?.items ?? []) as CandidateListItem[];
    },
    enabled,
    staleTime: 20_000,
  });

  const loading = enabled && (jobsLoading || candLoading);
  const showEmpty =
    enabled && !loading && jobs.length === 0 && candidates.length === 0 && debounced.length >= 2;

  const close = () => setOpen(false);

  const goJob = (job: Job) => {
    close();
    router.push(`/dashboard/jobs/${job.id}`);
  };

  const goCandidate = (c: CandidateListItem) => {
    close();
    router.push(`/dashboard/candidates?candidateId=${encodeURIComponent(c.id)}`);
  };

  const goJobsList = () => {
    close();
    const q = query.trim();
    router.push(q ? `/dashboard/jobs?q=${encodeURIComponent(q)}` : '/dashboard/jobs');
  };

  const goCandidatesList = () => {
    close();
    const q = query.trim();
    router.push(q ? `/dashboard/candidates?q=${encodeURIComponent(q)}` : '/dashboard/candidates');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="global-search-backdrop"
            type="button"
            aria-label="Close search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/55 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            key="global-search-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[10001] flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem))] w-[min(100%-1.5rem,520px)] -translate-x-1/2 translate-y-2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.35)] sm:top-[max(2.5rem,8vh)] sm:translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/25">
                  <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
                  <input
                    ref={inputRef}
                    data-global-search-field
                    type="search"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={canSearch ? 'Search jobs & candidates…' : 'Search'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        close();
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                  {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" aria-hidden />}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-2 sm:p-3 custom-scrollbar">
              <p id="global-search-title" className="sr-only">
                Global search
              </p>

              {!user && (
                <p className="px-3 py-8 text-center text-sm font-medium text-slate-700">Sign in to search.</p>
              )}

              {user && !canSearch && (
                <p className="px-3 py-8 text-center text-sm font-medium text-slate-700">
                  Quick search is available for recruiter and admin roles.
                </p>
              )}

              {user && canSearch && query.trim().length > 0 && query.trim().length < 2 && (
                <p className="px-3 py-6 text-center text-sm text-slate-600">
                  Type at least 2 characters to search the API.
                </p>
              )}

              {user && canSearch && query.trim().length === 0 && (
                <div className="space-y-1 px-2 py-2">
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Go to
                  </p>
                  <button
                    type="button"
                    onClick={goJobsList}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                  >
                    <Briefcase className="h-4 w-4 shrink-0 text-blue-600" />
                    Browse jobs
                  </button>
                  <button
                    type="button"
                    onClick={goCandidatesList}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4 shrink-0 text-blue-600" />
                    Candidates
                  </button>
                </div>
              )}

              {showEmpty && (
                <p className="px-4 py-10 text-center text-sm font-medium leading-relaxed text-slate-800">
                  No jobs or candidates match{' '}
                  <span className="break-all font-semibold text-slate-900">&ldquo;{debounced}&rdquo;</span>.
                </p>
              )}

              {enabled && !loading && jobs.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Jobs
                  </p>
                  <ul className="space-y-0.5">
                    {jobs.map((job) => (
                      <li key={job.id}>
                        <button
                          type="button"
                          onClick={() => goJob(job)}
                          className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left hover:bg-slate-100"
                        >
                          <span className="truncate text-sm font-semibold text-slate-900">{job.title}</span>
                          <span className="truncate text-xs text-slate-600">
                            {(job as { companyName?: string }).companyName ?? '—'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {enabled && !loading && candidates.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Candidates
                  </p>
                  <ul className="space-y-0.5">
                    {candidates.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => goCandidate(c)}
                          className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left hover:bg-slate-100"
                        >
                          <span className="truncate text-sm font-semibold text-slate-900">{c.name}</span>
                          <span className="truncate text-xs text-slate-600">{c.email ?? '—'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <span className="hidden sm:inline">Open with </span>
              <kbd className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-[11px] font-medium text-slate-800 shadow-sm">
                {typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="ml-1 rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-[11px] font-medium text-slate-800 shadow-sm">
                K
              </kbd>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
