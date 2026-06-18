'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { RouteGuard } from '@/components/RouteGuard';
import { Drawer } from '@/components/ui/Drawer';
import type { Project } from '@/types';
import Link from 'next/link';

const PROJECTS_KEY = ['projects'] as const;

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const { data: projectsData, isLoading } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const res = await api.projects.list();
      if (!res.data?.success) return [];
      return res.data.data as Project[];
    },
  });

  const projects = projectsData ?? [];

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => api.projects.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      setProjectName('');
      setAddProjectOpen(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Failed to create project');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? 'Failed to delete project');
    },
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const name = projectName.trim();
    if (!name) {
      setError('Project name is required');
      return;
    }
    createProjectMutation.mutate(name);
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Manage your candidate cohorts and talent maps.
            </p>
          </div>
          <button
            onClick={() => {
              setAddProjectOpen(true);
              setError('');
              setProjectName('');
            }}
            className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No projects yet</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Create your first project to start organizing candidates.
            </p>
            <button
              onClick={() => setAddProjectOpen(true)}
              className="mt-6 btn-primary rounded-lg px-4 py-2 text-sm font-medium"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-muted)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                        deleteProjectMutation.mutate(project.id);
                      }
                    }}
                    className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)] line-clamp-1">{project.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  {project.candidateCount !== undefined && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span className="text-xs font-medium text-[var(--primary)]">
                        {project.candidateCount} {project.candidateCount === 1 ? 'candidate' : 'candidates'}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <Link
                    href={`/dashboard/candidates?projectId=${project.id}`}
                    className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    View Pipeline
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <Drawer
          isOpen={addProjectOpen}
          onClose={() => setAddProjectOpen(false)}
          title="Create New Project"
          className="sm:max-w-md"
        >
          <form onSubmit={handleAddProject} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-[var(--foreground)]">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. AI/ML Engineer Sourcing"
                className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                required
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Try to be specific, like &quot;Backend Roles Q1&quot; or &quot;Google Sourcing&quot;.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setAddProjectOpen(false)}
                className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="flex-1 btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </RouteGuard>
  );
}
