/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { RouteGuard } from '@/components/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, ApplicationStage } from '@/types';

const PIPELINE_STAGES: {
  id: ApplicationStage;
  label: string;
  accentBorder: string;
}[] = [
    { id: 'applied', label: 'Applied', accentBorder: 'border-l-sky-500' },
    { id: 'screening', label: 'Screening', accentBorder: 'border-l-amber-500' },
    { id: 'interview', label: 'Interview', accentBorder: 'border-l-violet-500' },
    { id: 'offered', label: 'Offer', accentBorder: 'border-l-emerald-500' },
    { id: 'hired', label: 'Hired', accentBorder: 'border-l-green-500' },
    { id: 'rejected', label: 'Rejected', accentBorder: 'border-l-slate-500' },
  ];

const STAGE_IDS = PIPELINE_STAGES.map((s) => s.id);

/** Blue line + arrow between pipeline cards (horizontal) */
function FlowConnectorRight() {
  return (
    <div className="hidden sm:flex sm:items-center sm:justify-center sm:px-1" aria-hidden>
      <div className="flex items-center">
        <div className="h-0.5 w-4 bg-[var(--primary)] sm:w-6" />
        <svg className="h-4 w-4 shrink-0 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

/** Blue line + arrow from row1 to row2 (vertical) */
function FlowConnectorDown() {
  return (
    <div className="hidden sm:flex sm:items-center sm:justify-center sm:py-2" aria-hidden>
      <div className="flex flex-col items-center">
        <div className="h-4 w-0.5 shrink-0 bg-[var(--primary)] sm:h-6" />
        <svg className="h-4 w-4 shrink-0 -mt-0.5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function ApplicationCard({
  app,
  isDragOverlay,
  showHandle = true,
  dragHandleProps,
}: {
  app: Application;
  isDragOverlay?: boolean;
  showHandle?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const router = useRouter();
  const [resumeLoading, setResumeLoading] = useState(false);
  const name = (app.candidate?.name ?? '').trim() || 'Unknown';
  const initials = getInitials(name);
  const isFullResumeUrl = app.resumeUrl?.startsWith('http://') || app.resumeUrl?.startsWith('https://');

  const openResume = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!app.id || resumeLoading) return;
      setResumeLoading(true);
      try {
        const { data } = await api.applications.getResumeBlob(app.id);
        const url = URL.createObjectURL(data as Blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (err) {
        setResumeLoading(false);
        router.refresh();
      } finally {
        setResumeLoading(false);
      }
    },
    [app.id, resumeLoading, router]
  );

  return (
    <div
      className={`flex min-w-0 items-start gap-2.5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-sm)] transition-all duration-200 sm:gap-3 sm:p-3.5 ${isDragOverlay
        ? 'cursor-grabbing border-[var(--primary)] shadow-lg ring-2 ring-[var(--primary)]/20 scale-[1.02]'
        : 'hover:border-[var(--muted-foreground)]/30 hover:shadow-md'
        } ${!isDragOverlay && dragHandleProps ? 'cursor-grab' : ''}`}
    >
      {showHandle && (
        <div
          className={`mt-0.5 shrink-0 touch-none select-none text-[var(--muted-foreground)] ${isDragOverlay ? 'opacity-100' : 'opacity-60 hover:opacity-90'} ${!isDragOverlay && dragHandleProps ? 'cursor-grab active:cursor-grabbing' : ''}`}
          aria-hidden
          {...dragHandleProps}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="break-words text-xs font-medium leading-snug text-[var(--foreground)] overflow-hidden" style={{ overflowWrap: 'break-word' }}>{name}</p>
            <p className="line-clamp-2 break-all text-xs text-[var(--muted-foreground)] mt-0.5 overflow-hidden" title={app.candidate?.email ?? undefined}>{app.candidate?.email ?? '—'}</p>
          </div>
        </div>
        {app.resumeUrl && (
          isFullResumeUrl ? (
            <a
              href={app.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/30"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume
            </a>
          ) : (
            <button
              type="button"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/30 disabled:opacity-60"
              onClick={openResume}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={resumeLoading}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {resumeLoading ? 'Opening…' : 'Resume'}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function PipelineColumn({
  stageId,
  label,
  accentBorder,
  applications,
  isOver,
}: {
  stageId: ApplicationStage;
  label: string;
  accentBorder: string;
  applications: Application[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stageId });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[160px] w-full min-w-[10rem] max-w-[20rem] max-h-[min(65vh,560px)] flex-col shrink-0 overflow-hidden rounded-lg border border-[var(--border)] border-l-4 bg-[var(--card)] shadow-[var(--shadow-sm)] transition-all duration-200 sm:min-w-[11rem] lg:max-w-none ${accentBorder} ${isOver ? 'ring-2 ring-[var(--primary)] ring-offset-2 shadow-md' : ''
        }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/60 px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] sm:text-sm">
          {label}
        </span>
        <span className="flex h-6 min-w-[26px] items-center justify-center rounded-md bg-[var(--muted)]/30 px-2 text-xs font-semibold text-[var(--foreground)] sm:min-w-[28px] sm:px-2.5">
          {applications.length}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden bg-[var(--background)]/30 p-2.5 sm:p-3">
        {applications.map((app) => (
          <DraggableCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: app.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 cursor-grab active:cursor-grabbing touch-manipulation ${isDragging ? 'opacity-40' : ''}`}
      {...attributes}
      {...listeners}
    >
      <ApplicationCard app={app} showHandle />
    </div>
  );
}

export default function ApplicantsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'pipeline', user?.id ?? 'anon'],
    queryFn: async () => {
      const { data: res } = await api.jobs.list({ page: 1, limit: 100, forRoleDropdown: true });
      if (!res.success || !res.data) return { items: [] };
      return res.data;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const jobs = jobsData?.items ?? [];

  const {
    data: applicationsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['applications', 'pipeline', user?.id ?? 'anon', selectedJobId],
    queryFn: async () => {
      const response = await api.applications.list({ jobId: selectedJobId, limit: 200 });
      const body = response.data as { success?: boolean; data?: { items?: unknown[]; total?: number; page?: number; limit?: number; totalPages?: number } };
      if (!body?.success || !body.data) return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
      const payload = body.data;
      const items = Array.isArray(payload.items) ? (payload.items as Application[]) : [];
      return {
        items,
        total: typeof payload.total === 'number' ? payload.total : items.length,
        page: payload.page ?? 1,
        limit: payload.limit ?? 50,
        totalPages: payload.totalPages ?? 1,
      };
    },
    enabled: !!user?.id && !!selectedJobId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const applications = useMemo(() => {
    const raw = applicationsData?.items;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [applicationsData?.items]);

  // Auto-select first job for recruiter so they see their pipeline immediately
  useEffect(() => {
    if (jobs.length === 0) {
      if (selectedJobId) setSelectedJobId('');
      return;
    }
    if (!selectedJobId || !jobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(jobs[0]!.id);
    }
  }, [jobs, selectedJobId]);

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ApplicationStage }) =>
      api.applications.updateStage(id, stage),
    onMutate: async ({ id, stage }) => {
      const queryKey = ['applications', 'pipeline', user?.id ?? 'anon', selectedJobId];
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<{ items: Application[] }>(queryKey);
      if (prev) {
        queryClient.setQueryData<{ items: Application[] }>(queryKey, {
          ...prev,
          items: prev.items.map((a) => (a.id === id ? { ...a, stage } : a)),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['applications', 'pipeline', user?.id ?? 'anon', selectedJobId], context.prev);
      }
      toast.error('Failed to update application stage');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'pipeline', user?.id ?? 'anon', selectedJobId] });
      toast.success('Application stage updated');
    },
  });

  const byStage = useCallback(() => {
    const map: Record<ApplicationStage, Application[]> = {
      applied: [],
      screening: [],
      interview: [],
      offered: [],
      hired: [],
      rejected: [],
    };
    for (const app of applications) {
      const stage = STAGE_IDS.includes(app.stage) ? app.stage : 'applied';
      map[stage].push(app);
    }
    return map;
  }, [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  }, [applications]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id != null ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveApp(null);
      setOverId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const stage = STAGE_IDS.includes(over.id as ApplicationStage) ? (over.id as ApplicationStage) : null;
      if (!stage) return;
      const app = applications.find((a) => a.id === active.id);
      if (app && app.stage !== stage) {
        updateStageMutation.mutate({ id: app.id, stage });
      }
    },
    [applications, updateStageMutation]
  );

  const handleDragCancel = useCallback(() => {
    setActiveApp(null);
    setOverId(null);
  }, []);

  const grouped = byStage();

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="min-h-0 flex flex-col space-y-5 sm:space-y-6">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Hiring pipeline
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Drag applicants between stages. Changes save automatically.
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Candidates added from the Candidates page (with a job selected) appear here in Applied. Drag to update stage.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <label htmlFor="job-select" className="text-sm font-medium text-[var(--foreground)]">
              Job
            </label>
            <select
              id="job-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 sm:w-auto sm:min-w-[240px]"
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </header>

        {!selectedJobId ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]/30 py-16 sm:py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]/40">
              <svg className="h-7 w-7 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="mt-5 text-base font-medium text-[var(--foreground)]">Select a job to view the pipeline</p>
            <p className="mt-1.5 max-w-sm text-center text-sm text-[var(--muted-foreground)]">
              Applicants will appear as cards you can drag between Applied, Screening, Interview, Offer, Hired, and Rejected.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20">
            <div className="h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">Loading applicants…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 py-14 text-center">
            <p className="font-medium text-[var(--foreground)]">Could not load applications</p>
            <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
              {error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { status?: number } }).response?.status === 403
                  ? 'You don’t have access to this job’s applications. Assign the job to yourself (Jobs page) or use an admin account.'
                  : 'Check your connection and try again.'
                : 'Try selecting the job again or refresh the page.'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-sm)] sm:gap-x-6 sm:px-5 sm:py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tabular-nums text-[var(--foreground)] sm:text-2xl">{applications.length}</span>
                <span className="text-xs text-[var(--muted-foreground)] sm:text-sm">applicant{applications.length !== 1 ? 's' : ''} in pipeline</span>
              </div>
              <div className="hidden h-4 w-px shrink-0 bg-[var(--border)] sm:block" aria-hidden />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)] sm:gap-x-4 sm:text-sm" aria-label="Counts per stage">
                {PIPELINE_STAGES.map(({ id, label }) => (
                  <span key={id} className="flex items-center gap-1.5">
                    <span className="font-semibold tabular-nums text-[var(--foreground)]">{grouped[id].length}</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3 text-sm text-[var(--foreground)]">
              <p className="font-medium">About this pipeline</p>
              <p className="mt-1 text-[var(--muted-foreground)]">
                This pipeline is <strong>for the job selected above</strong>. When you add a candidate (Candidates page) you must select a job — they then appear here in Applied and in the Candidates list. Drag cards to update their stage.
              </p>
            </div>
            <div className="pb-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-x-2 sm:gap-y-4">
                {/* Row 1: Applied → Screening → Interview */}
                <PipelineColumn key="applied" stageId="applied" label={PIPELINE_STAGES[0].label} accentBorder={PIPELINE_STAGES[0].accentBorder} applications={grouped.applied} isOver={overId === 'applied'} />
                <FlowConnectorRight />
                <PipelineColumn key="screening" stageId="screening" label={PIPELINE_STAGES[1].label} accentBorder={PIPELINE_STAGES[1].accentBorder} applications={grouped.screening} isOver={overId === 'screening'} />
                <FlowConnectorRight />
                <PipelineColumn key="interview" stageId="interview" label={PIPELINE_STAGES[2].label} accentBorder={PIPELINE_STAGES[2].accentBorder} applications={grouped.interview} isOver={overId === 'interview'} />
                {/* Row 2: vertical flow (center) */}
                <div className="hidden sm:block" aria-hidden />
                <div className="hidden sm:block" aria-hidden />
                <div className="hidden sm:col-start-3 sm:row-start-2 sm:flex sm:items-center sm:justify-center sm:py-2" aria-hidden>
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-0.5 shrink-0 bg-[var(--primary)] sm:h-6" />
                    <svg className="h-4 w-4 shrink-0 -mt-0.5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="hidden sm:block" aria-hidden />
                <div className="hidden sm:block" aria-hidden />
                {/* Row 3: Offer → Hired → Rejected */}
                <PipelineColumn key="offered" stageId="offered" label={PIPELINE_STAGES[3].label} accentBorder={PIPELINE_STAGES[3].accentBorder} applications={grouped.offered} isOver={overId === 'offered'} />
                <FlowConnectorRight />
                <PipelineColumn key="hired" stageId="hired" label={PIPELINE_STAGES[4].label} accentBorder={PIPELINE_STAGES[4].accentBorder} applications={grouped.hired} isOver={overId === 'hired'} />
                <FlowConnectorRight />
                <PipelineColumn key="rejected" stageId="rejected" label={PIPELINE_STAGES[5].label} accentBorder={PIPELINE_STAGES[5].accentBorder} applications={grouped.rejected} isOver={overId === 'rejected'} />
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeApp ? (
                <div className="rotate-0.5 opacity-95">
                  <ApplicationCard app={activeApp} isDragOverlay showHandle />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </RouteGuard>
  );
}
