/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { RouteGuard } from '@/components/RouteGuard';
import { Drawer, CustomDropdown } from '@/components/ui';
import { CandidateProfileModal } from '@/components/dashboard/CandidateProfileModal';
import { Plus, ChevronDown, Search, Briefcase, Linkedin, Github, Filter } from 'lucide-react';
import type { CandidateListItem, Project } from '@/types';

const CANDIDATES_KEY = ['candidates'] as const;
const PROJECTS_KEY = ['projects'] as const;
const JOBS_KEY = ['jobs'] as const;

/** Status values for dropdown – changing status updates table tag color */
const CANDIDATE_STATUS_OPTIONS = [
  'Sourced',
  'Contacted',
  'Replied',
  'Scheduled Call',
  'Screened',
  'Backburner',
  'Warm In Touch',
  'In Play',
  'Active',
  'Highly Rated',
  'Likely to Respond',
  'Expressed Interest',
];





/** Small icon inside status tag – dot for contact/sourced, person for active/touch, calendar for scheduled */
function StatusTagIcon({ status }: { status: string }) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('scheduled') || s.includes('call')) {
    return (
      <svg className="h-3 w-3 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (s.includes('contact') || s.includes('sourced') || s.includes('rated') || s.includes('interest')) {
    return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-90" />;
  }
  return (
    <svg className="h-3 w-3 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
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

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const { hasRole } = useAuth();
  const isAdmin = hasRole?.('admin') ?? false;
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState(initialProjectId);
  const [jobFilter, setJobFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [statusGroup, setStatusGroup] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Sync state if URL changes (e.g. from Sidebar or another page)
  useEffect(() => {
    const pid = searchParams.get('projectId') || '';
    if (pid !== projectFilter) {
      setProjectFilter(pid);
      setPage(1);
    }
  }, [searchParams, projectFilter]);

  const qFromUrl = searchParams.get('q')?.trim() ?? '';
  useEffect(() => {
    if (qFromUrl) {
      setSearch(qFromUrl);
      setPage(1);
    }
  }, [qFromUrl]);

  useEffect(() => {
    const cid = searchParams.get('candidateId');
    if (cid) setSelectedCandidateId(cid);
  }, [searchParams]);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [editCandidate, setEditCandidate] = useState<CandidateListItem | null>(null);
  const [addToPipelineCandidate, setAddToPipelineCandidate] = useState<CandidateListItem | null>(null);
  const [addToPipelineJobId, setAddToPipelineJobId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    linkedInUrl: '',
    githubUrl: '',
    projectId: '' as string,
    jobId: '' as string,
    status: 'Sourced',
    location: '',
    resumeUrl: '',
    resumePublicId: '',
    resumeText: '',
    skills: [] as string[],
  });
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [error, setError] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const res = await api.projects.list();
      if (!res.data?.data) return [];
      return res.data.data as Project[];
    },
  });
  const projects = projectsData ?? [];

  const { data: jobsListData } = useQuery({
    queryKey: [...JOBS_KEY, { limit: 200, forRoleDropdown: true }],
    queryFn: async () => {
      const res = await api.jobs.list({ limit: 200, forRoleDropdown: true });
      if (!res.data?.success || !res.data.data) return { items: [] };
      return res.data.data;
    },
  });
  const jobsForApply = jobsListData?.items ?? [];

  const { data: filterOptions } = useQuery({
    queryKey: ['candidate-filters'],
    queryFn: async () => {
      const res = await api.candidates.getFilters();
      return res.data?.data ?? { locations: [], tags: [] };
    },
  });
  const availableLocations = filterOptions?.locations ?? [];
  const availableTags = filterOptions?.tags ?? [];

  const jobLocations = Array.from(new Set(jobsForApply.map(j => j.location).filter(Boolean)));
  const allSuggestedLocations = Array.from(new Set([...availableLocations, ...jobLocations])).sort();

  const { data: listData, isLoading } = useQuery({
    queryKey: [...CANDIDATES_KEY, { page, limit: 20, search: search.trim() || undefined, projectId: projectFilter || undefined, jobId: jobFilter || undefined, location: locationFilter || undefined, tags: tagsFilter || undefined, statusGroup }],
    queryFn: async () => {
      const res = await api.candidates.list({
        page,
        limit: 20,
        search: search.trim() || undefined,
        projectId: projectFilter || undefined,
        jobId: jobFilter || undefined,
        location: locationFilter || undefined,
        tags: tagsFilter || undefined,
        statusGroup: statusGroup === 'all' ? undefined : statusGroup,
      });
      const body = res.data as { success?: boolean; data?: { items?: CandidateListItem[]; total?: number; page?: number; limit?: number; totalPages?: number; counts?: { all: number; activeCandidates: number; highlyRated: number; likelyToRespond: number; expressedInterest: number } } };
      if (!body?.success || !body.data) return { items: [], total: 0, page: 1, limit: 20, totalPages: 0, counts: { all: 0, activeCandidates: 0, highlyRated: 0, likelyToRespond: 0, expressedInterest: 0 } };
      return {
        ...body.data,
        counts: body.data.counts ?? { all: 0, activeCandidates: 0, highlyRated: 0, likelyToRespond: 0, expressedInterest: 0 },
      };
    },
  });

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const counts = listData?.counts ?? { all: 0, activeCandidates: 0, highlyRated: 0, likelyToRespond: 0, expressedInterest: 0 };

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => api.projects.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      setProjectName('');
    },
    onError: (err: unknown) => {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      setError(ax?.data?.message ?? 'Failed to create project');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
    onError: (err: unknown) => {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      setError(ax?.data?.message ?? 'Failed to delete project');
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: () =>
      api.candidates.create({
        name: candidateForm.name.trim(),
        email: candidateForm.email.trim(),
        phone: candidateForm.phone.trim() || undefined,
        linkedInUrl: candidateForm.linkedInUrl.trim() || undefined,
        githubUrl: candidateForm.githubUrl.trim() || undefined,
        projectId: candidateForm.projectId || null,
        jobId: candidateForm.jobId || null,
        status: candidateForm.status,
        location: candidateForm.location.trim() || undefined,
        resumeUrl: candidateForm.resumeUrl || null,
        resumePublicId: candidateForm.resumePublicId || null,
        resumeText: candidateForm.resumeText,
        skills: candidateForm.skills,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATES_KEY });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setCandidateForm({ name: '', email: '', phone: '', linkedInUrl: '', githubUrl: '', projectId: '', jobId: '', status: 'Sourced', location: '', resumeUrl: '', resumePublicId: '', resumeText: '', skills: [] });
      setError('');
      setAddCandidateOpen(false);
    },
    onError: (err: unknown) => {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      setError(ax?.data?.message ?? 'Failed to add candidate');
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.candidates.update>[1] }) =>
      api.candidates.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CANDIDATES_KEY });
      if (variables.data?.jobId) {
        queryClient.invalidateQueries({ queryKey: ['applications', variables.data.jobId] });
        queryClient.invalidateQueries({ queryKey: ['applications'] });
      }
      setEditCandidate(null);
      setError('');
    },
    onError: (err: unknown) => {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      setError(ax?.data?.message ?? 'Failed to update candidate');
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string) => api.candidates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATES_KEY });
      setEditCandidate(null);
    },
  });

  const handleExportCandidates = useCallback(async () => {
    try {
      const res = await api.candidates.exportCandidates();
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data as unknown as BlobPart]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidates-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    }
  }, []);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = projectName.trim();
    if (!name) {
      setError('Project name is required');
      return;
    }
    createProjectMutation.mutate(name);
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!candidateForm.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!candidateForm.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!candidateForm.jobId) {
      setError('Please select a Job (Role) so the candidate appears in the hiring pipeline.');
      return;
    }
    createCandidateMutation.mutate();
  };

  const openEdit = useCallback((c: CandidateListItem) => {
    setEditCandidate(c);
    setCandidateForm({
      name: c.name,
      email: c.email,
      phone: c.phone ?? '',
      linkedInUrl: c.linkedInUrl ?? '',
      githubUrl: c.githubUrl ?? '',
      projectId: c.projectId ?? '',
      jobId: c.jobId ?? '',
      status: c.status ?? 'Sourced',
      location: (c as any).location ?? '',
      resumeUrl: (c as any).resumeUrl ?? '',
      resumePublicId: (c as any).resumePublicId ?? '',
      resumeText: (c as any).resumeText ?? '',
      skills: (c as any).skills ?? [],
    });
    setError('');
  }, []);

  const handleUpdateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCandidate) return;
    setError('');
    updateCandidateMutation.mutate({
      id: editCandidate.id,
      data: {
        name: candidateForm.name.trim(),
        email: candidateForm.email.trim(),
        phone: candidateForm.phone.trim(),
        linkedInUrl: candidateForm.linkedInUrl.trim() || undefined,
        githubUrl: candidateForm.githubUrl.trim() || undefined,
        projectId: candidateForm.projectId || null,
        jobId: candidateForm.jobId || null,
        status: candidateForm.status,
        location: candidateForm.location.trim() || undefined,
        resumeUrl: candidateForm.resumeUrl || null,
        resumePublicId: candidateForm.resumePublicId || null,
        resumeText: candidateForm.resumeText,
        skills: candidateForm.skills,
      },
    });
  };

  const limit = 20;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const statusOptions = [
    { id: 'all', label: 'All', countKey: 'all' as const },
    { id: 'activeCandidates', label: 'Active Candidates', countKey: 'activeCandidates' as const },
    { id: 'highlyRated', label: 'Highly Rated', countKey: 'highlyRated' as const },
    { id: 'likelyToRespond', label: 'Likely to Respond', countKey: 'likelyToRespond' as const },
    { id: 'expressedInterest', label: 'Expressed Interest', countKey: 'expressedInterest' as const },
  ];

  /** Subtle status tags – Professional enterprise look */
  const statusTagColor = (status: string): string => {
    const s = (status ?? '').toLowerCase();
    if (s.includes('contact') || s.includes('connect')) return 'bg-red-50 text-red-700 border border-red-100';
    if (s.includes('stay') && s.includes('touch')) return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (s.includes('play') || s.includes('warm') || s.includes('reach') || s.includes('touch') || s === 'active' || s.includes('in touch')) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (s.includes('sourced')) return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (s.includes('scheduled')) return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (s.includes('highly') || s.includes('rated')) return 'bg-amber-50 text-amber-800 border border-amber-200';
    if (s.includes('likely') || s.includes('respond')) return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    if (s.includes('interest') || s.includes('expressed')) return 'bg-teal-50 text-teal-700 border border-teal-100';
    return 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        
        {/* Professional Header */}
        <div className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center sm:pt-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Candidates</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track your global talent pool.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCandidateForm({ name: '', email: '', phone: '', linkedInUrl: '', githubUrl: '', projectId: '', jobId: '', status: 'Sourced', location: '', resumeUrl: '', resumePublicId: '', resumeText: '', skills: [] });
              setAddCandidateOpen(true);
              setError('');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black sm:w-auto sm:py-2.5 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>

        {/* Premium Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Left: Filters Group — horizontal scroll on narrow screens */}
            <div className="flex-1 overflow-x-auto overscroll-x-contain p-4 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none [-webkit-overflow-scrolling:touch]">
              <div className="flex min-w-max flex-nowrap items-center gap-3 sm:min-w-0 sm:flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-400">
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
              </div>

              {/* Status Filter */}
              <CustomDropdown
                options={statusOptions.map(opt => ({ id: opt.id, label: `${opt.label} (${counts[opt.countKey]})` }))}
                value={statusGroup}
                onChange={(val) => { setStatusGroup(val); setPage(1); }}
                className="min-w-[140px]"
              />

              {/* Roles (Jobs) Filter */}
              <CustomDropdown
                options={[{ id: '', label: 'All Roles' }, ...jobsForApply.map(j => ({ id: j.id, label: j.title }))]}
                value={jobFilter}
                onChange={(val) => { setJobFilter(val); setPage(1); }}
                className="min-w-[150px]"
              />

              {/* Projects Filter */}
              <CustomDropdown
                options={[{ id: '', label: 'All Projects' }, ...projects.map(p => ({ id: p.id, label: p.name }))]}
                value={projectFilter}
                onChange={(val) => { setProjectFilter(val); setPage(1); }}
                className="min-w-[150px]"
              />

              <div className="mx-1 hidden h-6 w-px bg-gray-100 lg:block" />

              {/* Location Filter */}
              <CustomDropdown
                options={[{ id: '', label: 'All Locations' }, ...availableLocations.map(loc => ({ id: loc, label: loc }))]}
                value={locationFilter}
                onChange={(val) => { setLocationFilter(val); setPage(1); }}
                className="min-w-[140px]"
              />

              {/* Tags Filter */}
              <CustomDropdown
                options={[{ id: '', label: 'All Tags' }, ...availableTags.map(tag => ({ id: tag, label: tag }))]}
                value={tagsFilter}
                onChange={(val) => { setTagsFilter(val); setPage(1); }}
                className="min-w-[120px]"
              />
              </div>
            </div>

            {/* Right: Search Group */}
            <div className="p-4 bg-gray-50/30 lg:w-96 rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Seach by name, email, or role..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flat Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Loading candidates...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">No candidates found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or adding a new candidate.</p>
              </div>
            </div>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6 sm:py-4">Candidate</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6 sm:py-4">Status</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6 sm:py-4">Role/Project</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6 sm:py-4">Added On</th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right sm:px-6 sm:py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedCandidateId(c.id)} className="flex-shrink-0">
                            {c.avatar ? (
                              <img src={c.avatar} alt="" className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                {getInitials(c.name)}
                              </div>
                            )}
                          </button>
                            <div className="min-w-0">
                              <button
                                onClick={() => setSelectedCandidateId(c.id)}
                                className="block text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                              >
                                {c.name}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500 truncate">{c.email}</span>
                                <div className="flex items-center gap-1.5 ml-1">
                                  {c.linkedInUrl && (
                                    <a 
                                      href={c.linkedInUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-[#0077b5] hover:opacity-80 transition-opacity"
                                      title="LinkedIn Profile"
                                    >
                                      <Linkedin className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {c.githubUrl && (
                                    <a 
                                      href={c.githubUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-gray-900 dark:text-gray-400 hover:opacity-80 transition-opacity"
                                      title="GitHub Profile"
                                    >
                                      <Github className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${statusTagColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="max-w-[180px]">
                          {c.jobId && (c.jobTitle ?? '').trim() ? (
                            <Link
                              href={`/dashboard/jobs?jobId=${c.jobId}`}
                              className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1.5 truncate w-full"
                            >
                              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{c.jobTitle}</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500 italic">{c.projectName ?? 'Not assigned'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(c.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(c)} 
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { if (window.confirm(`Delete candidate "${c.name}"?`)) deleteCandidateMutation.mutate(c.id); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Pagination */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:px-6">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="text-gray-900 font-bold">{start}-{end}</span> of <span className="text-gray-900 font-bold">{total}</span> candidates
            </p>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="text-xs font-bold text-gray-700 mx-2">
                  Page {page} of {totalPages || 1}
               </div>
               <button
                  onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={page >= (totalPages || 1)}
                  className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage projects drawer */}
      <Drawer isOpen={addProjectOpen} onClose={() => setAddProjectOpen(false)} title="Manage projects" className="sm:max-w-md">
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Projects = custom tags/folders. Recruiters can only delete their own projects.
        </p>

        <form onSubmit={handleAddProject} className="space-y-4 mb-8 pb-6 border-b border-[var(--border)]">
          {error && (
            <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">New project name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. AI/ML Engineer"
                className="input-field w-full"
                required
              />
              <button type="submit" disabled={createProjectMutation.isPending} className="btn-primary rounded-lg px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50">
                {createProjectMutation.isPending ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Your Projects</h4>
          {projects.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] italic">No projects yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-2.5 rounded border border-gray-100 bg-gray-50 shadow-sm hover:bg-white transition-colors">
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this project?')) {
                        deleteProjectMutation.mutate(p.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                    title="Delete project"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Drawer>

      {/* Add candidate drawer – no image required */}
      <Drawer isOpen={addCandidateOpen} onClose={() => setAddCandidateOpen(false)} title="Add candidate" className="sm:max-w-md">
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Profile image is optional. You can add or update it later from Edit.
        </p>
        <form onSubmit={handleAddCandidate} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>
          )}

          <div className="rounded border border-dashed border-[var(--border)] p-4 text-center">
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">Resume Auto-Fill</h4>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">Upload a PDF to pre-fill info and extract keywords</p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="resume-upload"
              disabled={isUploadingResume}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploadingResume(true);
                try {
                  const res = await api.upload.parseResume(file);
                  const data = res.data?.data;
                  if (data) {
                    setCandidateForm((f) => ({
                      ...f,
                      name: data.extracted?.name || f.name,
                      email: data.extracted?.email || f.email,
                      phone: data.extracted?.phone || f.phone,
                      linkedInUrl: data.extracted?.linkedInUrl || f.linkedInUrl,
                      resumeUrl: data.fileUrl,
                      resumePublicId: data.publicId,
                      resumeText: data.resumeText || data.text || '',
                      skills: data.skills || [],
                    }));
                  }
                } catch {
                  setError('Failed to process resume');
                } finally {
                  setIsUploadingResume(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('resume-upload')?.click()}
              disabled={isUploadingResume}
              className="btn-ghost text-xs px-3 py-1.5 h-auto disabled:opacity-50 border border-[var(--border)] hover:bg-[var(--background)]"
            >
              {isUploadingResume ? 'Processing...' : 'Upload PDF'}
            </button>
            {candidateForm.resumeUrl && <p className="mt-2 text-xs text-emerald-600 font-medium">Resume parsed successfully!</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Name *</label>
            <input
              type="text"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Email *</label>
            <input
              type="email"
              value={candidateForm.email}
              onChange={(e) => setCandidateForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="john@email.com"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Job (Role) *</label>
            <p className="mb-1.5 text-xs text-[var(--muted-foreground)]">Candidate will appear in Candidates list and in this job&apos;s Hiring pipeline (Applied). You can drag them to other stages later.</p>
            <select
              value={candidateForm.jobId ? `job-${candidateForm.jobId}` : candidateForm.projectId ? `project-${candidateForm.projectId}` : ''}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setCandidateForm((f) => ({ ...f, jobId: '', projectId: '', location: '' }));
                } else if (v.startsWith('job-')) {
                  const id = v.slice(4);
                  const selectedJob = jobsForApply.find(j => j.id === id);
                  setCandidateForm((f) => ({ 
                    ...f, 
                    jobId: id, 
                    projectId: '', 
                    location: selectedJob?.location || f.location 
                  }));
                } else {
                  setCandidateForm((f) => ({ ...f, projectId: v.slice(8), jobId: '' }));
                }
              }}
              className="input-field w-full"
              required
            >
              <option value="">Select a job (required)</option>
              <optgroup label="Role (Job)">
                {jobsForApply.map((job) => (
                  <option key={`job-${job.id}`} value={`job-${job.id}`}>{job.title}</option>
                ))}
              </optgroup>
              <optgroup label="Project (optional)">
                {projects.map((p) => (
                  <option key={`project-${p.id}`} value={`project-${p.id}`}>{p.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">LinkedIn URL</label>
            <input
              type="url"
              value={candidateForm.linkedInUrl}
              onChange={(e) => setCandidateForm((f) => ({ ...f, linkedInUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">GitHub URL</label>
            <input
              type="url"
              value={candidateForm.githubUrl}
              onChange={(e) => setCandidateForm((f) => ({ ...f, githubUrl: e.target.value }))}
              placeholder="https://github.com/username"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Location</label>
            <input
              type="text"
              value={candidateForm.location}
              onChange={(e) => setCandidateForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Mumbai, India"
              className="input-field w-full"
              list="candidate-locations-list"
            />
            <datalist id="candidate-locations-list">
              {allSuggestedLocations.map(loc => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Phone</label>
            <input
              type="tel"
              value={candidateForm.phone}
              onChange={(e) => setCandidateForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
              className="input-field w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAddCandidateOpen(false)} className="btn-ghost rounded-lg px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={createCandidateMutation.isPending} className="btn-primary rounded-lg px-4 py-2 text-sm disabled:opacity-50">
              {createCandidateMutation.isPending ? 'Adding…' : 'Add candidate'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Edit candidate drawer – optional image update */}
      <Drawer isOpen={!!editCandidate} onClose={() => setEditCandidate(null)} title="Edit candidate" className="sm:max-w-md">
        {editCandidate && (
          <>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Update profile. To add or change photo: upload below then save. No image is fine – no error.
            </p>
            <EditCandidateForm
              candidate={editCandidate}
              form={candidateForm}
              setForm={setCandidateForm}
              projects={projects}
              jobs={jobsForApply}
              allSuggestedLocations={allSuggestedLocations}
              error={error}
              onSave={handleUpdateCandidate}
              onClose={() => setEditCandidate(null)}
              isPending={updateCandidateMutation.isPending}
              onImageUpload={(url, publicId) => {
                updateCandidateMutation.mutate({
                  id: editCandidate.id,
                  data: { avatar: url, avatarPublicId: publicId },
                });
                setCandidateForm((f) => ({ ...f }));
                setEditCandidate((prev) => prev ? { ...prev, avatar: url, avatarPublicId: publicId } : null);
              }}
            />
          </>
        )}
      </Drawer>

      <CandidateProfileModal
        candidateId={selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
      />
    </RouteGuard>
  );
}

function EditCandidateForm({
  candidate,
  form,
  setForm,
  projects,
  jobs,
  allSuggestedLocations,
  error,
  onSave,
  onClose,
  isPending,
  onImageUpload,
}: {
  candidate: CandidateListItem;
  form: { name: string; email: string; phone: string; linkedInUrl: string; githubUrl: string; projectId: string; jobId: string; status: string; location: string; resumeUrl: string; resumePublicId: string; resumeText: string; skills: string[] };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  projects: Project[];
  jobs: { id: string; title: string; location?: string }[];
  allSuggestedLocations: string[];
  error: string;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  isPending: boolean;
  onImageUpload: (url: string, publicId: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const res = await api.upload.profilePhoto(file);
      const body = res as { success?: boolean; data?: { secureUrl?: string; publicId?: string } };
      if (body?.success && body?.data?.secureUrl && body?.data?.publicId) {
        onImageUpload(body.data.secureUrl, body.data.publicId);
      }
    } catch {
      // Optional: no error required; user can try again
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>
      )}
      <div className="flex items-center gap-4">
        {candidate.avatar ? (
          <img src={candidate.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-muted)] text-lg font-semibold text-[var(--primary)]">
            {getInitials(candidate.name)}
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Profile photo (optional)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-1 text-sm text-[var(--primary)] hover:underline disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload image (Cloudinary)'}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input-field w-full"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="input-field w-full"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Project / Role</label>
        <select
          value={form.jobId ? `job-${form.jobId}` : form.projectId ? `project-${form.projectId}` : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              setForm((f) => ({ ...f, jobId: '', projectId: '', location: '' }));
            } else if (v.startsWith('job-')) {
              const id = v.slice(4);
              const selectedJob = jobs.find(j => j.id === id);
              setForm((f) => ({ 
                ...f, 
                jobId: id, 
                projectId: '', 
                location: selectedJob?.location || f.location 
              }));
            } else {
              setForm((f) => ({ ...f, projectId: v.slice(8), jobId: '' }));
            }
          }}
          className="input-field w-full"
        >
          <option value="">None</option>
          <optgroup label="Role (Job)">
            {jobs.map((job) => (
              <option key={`job-${job.id}`} value={`job-${job.id}`}>{job.title}</option>
            ))}
          </optgroup>
          <optgroup label="Project">
            {projects.map((p) => (
              <option key={`project-${p.id}`} value={`project-${p.id}`}>{p.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          placeholder="e.g. Mumbai, India"
          className="input-field w-full"
          list="edit-candidate-locations-list"
        />
        <datalist id="edit-candidate-locations-list">
          {allSuggestedLocations.map(loc => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
      </div>

      <div className="rounded border border-dashed border-[var(--border)] p-4 text-center">
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">Update Resume content</h4>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">Upload a new PDF to update info and keywords</p>
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingResume(true);
            try {
              const res = await api.upload.parseResume(file);
              const bodyData = res.data?.data;
              if (bodyData) {
                setForm(f => ({
                  ...f,
                  name: bodyData.extracted?.name || f.name,
                  email: bodyData.extracted?.email || f.email,
                  phone: bodyData.extracted?.phone || f.phone,
                  linkedInUrl: bodyData.extracted?.linkedInUrl || f.linkedInUrl,
                  resumeUrl: bodyData.fileUrl,
                  resumePublicId: bodyData.publicId,
                  resumeText: bodyData.resumeText || bodyData.text || '',
                  skills: bodyData.skills || [],
                }));
              }
            } catch {
              // Ignore failure, candidate can just type manually
            } finally {
              setUploadingResume(false);
              e.target.value = '';
            }
          }}
          disabled={uploadingResume}
        />
        <button
          type="button"
          onClick={() => resumeInputRef.current?.click()}
          disabled={uploadingResume}
          className="btn-ghost text-xs px-3 py-1.5 h-auto disabled:opacity-50 border border-[var(--border)] hover:bg-[var(--background)]"
        >
          {uploadingResume ? 'Processing resume...' : 'Upload & Parse new PDF'}
        </button>
        {(form as any).resumeUrl && <p className="mt-2 text-xs text-emerald-600 font-medium">Resume parsed successfully!</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">LinkedIn URL</label>
        <input
          type="url"
          value={form.linkedInUrl}
          onChange={(e) => setForm((f) => ({ ...f, linkedInUrl: e.target.value }))}
          className="input-field w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">GitHub URL</label>
        <input
          type="url"
          value={form.githubUrl}
          onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
          className="input-field w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="input-field w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          className="input-field w-full"
        >
          {!CANDIDATE_STATUS_OPTIONS.includes(form.status) && (
            <option value={form.status}>{form.status}</option>
          )}
          {CANDIDATE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Status change will update the tag color in the table.</p>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost rounded-lg px-4 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary rounded-lg px-4 py-2 text-sm disabled:opacity-50">
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
