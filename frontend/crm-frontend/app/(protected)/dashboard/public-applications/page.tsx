'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { RouteGuard } from '@/components/RouteGuard';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { Globe, Mail, FileText, Briefcase, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'Failed to load public applications';
  }
  if (error instanceof Error) return error.message;
  return 'Failed to load public applications';
}

export default function PublicApplicationsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['applications', 'public'],
    queryFn: async () => {
      const response = await api.applications.listPaginated({ source: 'public', limit: 200 });
      const body = response.data;
      if (!body?.success || !body.data) {
        throw new Error((body as { message?: string })?.message || 'Failed to load public applications');
      }
      return Array.isArray(body.data.items) ? body.data.items : [];
    },
    refetchInterval: 10000,
  });

  const items = data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="mx-auto w-full max-w-[1100px] px-3 pb-16 sm:px-6">
        <div className="mb-6 mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 sm:mt-6 sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-900">Public Website Applicants</p>
              <p className="text-xs text-emerald-800/80 sm:text-sm">
                Applications submitted from <strong>quoreit.com/open-jobs</strong>
              </p>
            </div>
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-semibold text-gray-900 sm:text-3xl">Public Applicants</h1>

        {isError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{getErrorMessage(error)}</p>
            <p className="mt-2 text-xs text-red-600/90">
              If you see a server error, redeploy the backend on Railway (latest code fixes public applicants listing).
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500 py-12 text-center">Loading applications...</p>
        ) : isError ? null : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-600 font-medium">No public applications yet</p>
            <p className="text-sm text-gray-400 mt-1">They will appear here when candidates apply on the open jobs page.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((app: {
                    id: string;
                    candidate?: { name?: string; email?: string } | null;
                    job?: { title?: string } | null;
                    stage?: string;
                    createdAt?: string;
                    resumeUrl?: string | null;
                    questionAnswers?: { question: string; answer: string }[];
                  }) => {
                    const answers = app.questionAnswers ?? [];
                    const isOpen = expandedId === app.id;
                    return (
                    <tr key={app.id} className="hover:bg-gray-50/60 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{app.candidate?.name ?? '—'}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {app.candidate?.email ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-gray-700">
                          <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                          {app.job?.title ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-700">
                          {app.stage ?? 'applied'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {app.createdAt
                          ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {answers.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isOpen ? null : app.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {answers.length} answer{answers.length !== 1 ? 's' : ''}
                            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                        {isOpen && answers.length > 0 && (
                          <div className="mt-2 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs">
                            {answers.map((qa, i) => (
                              <div key={i}>
                                <p className="font-semibold text-gray-700">{qa.question}</p>
                                <p className="text-gray-600 mt-0.5 whitespace-pre-wrap">{qa.answer || '—'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
