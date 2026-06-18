'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { RouteGuard } from '@/components/RouteGuard';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => api.projects.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/dashboard/projects');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Failed to create project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    createProjectMutation.mutate(name.trim());
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Create New Project
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Projects help you organize candidates into cohorts, mandates, or talent maps.
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q1 Engineering Sourcing"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-muted)] outline-none transition-all shadow-sm"
                required
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-1">
                Use a descriptive name that your team can easily identify.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--border)] flex gap-4">
              <Link
                href="/dashboard/projects"
                className="flex-1 px-6 py-3.5 text-center text-sm font-bold text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-xl hover:bg-[var(--border)] transition-all active:scale-[0.98]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary-muted)] hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {createProjectMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-2">Smart Organization</h3>
            <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
              Projects act as smart folders. Once created, you can move candidates into these cohorts to track their progress outside of specific job applications.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-violet-50/50 border border-violet-100">
            <h3 className="text-sm font-bold text-violet-900 uppercase tracking-widest mb-2">Collaborative Sourcing</h3>
            <p className="text-sm text-violet-700/80 leading-relaxed font-medium">
              Projects can be filtered and exported, making it easy to share talent maps with clients or hiring managers during calibration sessions.
            </p>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
