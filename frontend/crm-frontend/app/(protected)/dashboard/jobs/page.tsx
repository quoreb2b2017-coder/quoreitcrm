/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { RouteGuard } from '@/components/RouteGuard';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import {
  PUBLIC_FORM_STEPS,
  PublicJobStep1,
  PublicJobStep2,
  PublicJobStep3,
  PublicJobStep4,
} from '@/components/jobs/PublicJobPostingSections';
import { JdPdfImport } from '@/components/jobs/JdPdfImport';
import type { ParsedJobFields } from '@/utils/parseJobDescription';
import type { Job, JobStatus, User, CloudinaryFile } from '@ats-saas/shared';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Plus,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  ChevronRight,
  Target,
  FileText,
  Video,
  Globe,
  Camera,
  Users,
  Check,
  Gift,
  HelpCircle,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';

const JOBS_KEY = ['jobs'] as const;

const parseSalaryNumbers = (value?: string) => {
  if (!value) return [];
  const matches = value.match(/\d[\d,.]*/g);
  if (!matches) return [];
  return matches
    .map((m) => {
      const cleaned = m.replace(/,/g, '');
      const numeric = Number.parseFloat(cleaned);
      if (!Number.isFinite(numeric)) return null;
      return /k\b/i.test(value) ? Math.round(numeric * 1000) : Math.round(numeric);
    })
    .filter((n): n is number => n !== null);
};

const getSalaryRange = (value?: string) => {
  const values = parseSalaryNumbers(value);
  if (values.length === 0) return null;
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: Math.min(...values), max: Math.max(...values) };
};

const formatSalaryLabel = (value?: number) => {
  if (value === undefined || value <= 0) return '$0k';
  return `$${Math.round(value / 1000)}k`;
};

const normalizeToStep = (value: number, step: number) => Math.round(value / step) * step;

export default function JobsPage({ publicWebsiteMode = false }: { publicWebsiteMode?: boolean } = {}) {
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = hasRole?.('admin') ?? false;
  const isRecruiter = (hasRole?.('recruiter') ?? false) && !publicWebsiteMode;
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('qualified');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);

  const searchParams = useSearchParams();

  const openResponsiveDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>, preferredWidth: number) => {
    const trigger = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sidePadding = 8;
    const verticalGap = 4;

    const width = Math.min(preferredWidth, Math.max(180, viewportWidth - sidePadding * 2));
    const left = Math.min(
      Math.max(sidePadding, trigger.left),
      Math.max(sidePadding, viewportWidth - width - sidePadding)
    );

    const top = trigger.bottom + verticalGap;
    const maxHeight = Math.max(140, viewportHeight - top - sidePadding);

    setDropdownRect({ left, top, width, maxHeight });
  }, []);

  useEffect(() => {
    if (searchParams?.get('new') === 'true' && isAdmin) {
      setEditingJob(null);
      setIsDrawerOpen(true);
    }
  }, [searchParams, isAdmin]);

  // Deep link / navbar search: ?q= from global search or shared links
  useEffect(() => {
    const q = searchParams?.get('q')?.trim() ?? '';
    if (q) setSearch(q);
  }, [searchParams]);

  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState<{ min: number; max: number } | null>(null);
  const [roleTypeFilter, setRoleTypeFilter] = useState('');

  const [canApplyOnly, setCanApplyOnly] = useState(false);
  const [workplacePreference, setWorkplacePreference] = useState<'all' | 'remote' | 'on-site'>('all');
  const [moreFiltersOptions, setMoreFiltersOptions] = useState({ minSalary100k: false, equity: false });

  // Form State
  const [form, setForm] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    location: '',
    salary: '',
    description: '',
    workplaceType: 'On-site',
    status: 'open' as JobStatus,
    skills: [] as string[],
    requirements: [] as string[],
    reward: '',
    recruiterIds: [] as string[],
    benefits: [] as string[],
    openings: 1,
    personalQuestions: [] as { question: string; required: boolean }[],
    // Public website JD fields (mapped to customFields on save)
    visa: '',
    reportsTo: '',
    interviewProcess: '',
    whatYoullDo: '',
    mustHaveText: '',
    niceToHaveText: '',
    notAFitText: '',
    experience: '',
    roleType: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: [...JOBS_KEY, search],
    queryFn: async () => {
      const { data: res } = await api.jobs.list({ page: 1, limit: 100, search: search || undefined });
      return res.data;
    },
    refetchInterval: 3000,
  });

  const { data: recruitersData } = useQuery({
    queryKey: ['recruiters'],
    queryFn: async () => {
      const { data: res } = await api.users.listRecruiters();
      return res.data;
    },
    enabled: isAdmin,
  });

  const recruiters = recruitersData || [];

  const createMutation = useMutation({
    mutationFn: (body: any) => api.jobs.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      setIsDrawerOpen(false);
      toast.success('Job created successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create job'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.jobs.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      setIsDrawerOpen(false);
      setEditingJob(null);
      toast.success('Job updated successfully');
    },
    onError: (err: any) => toast.error('Failed to update job'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.jobs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      setDeleteConfirm(null);
      toast.success('Job deleted successfully');
    }
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.jobs.acceptJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ['jobs_search', 'roleDropdown'] });
      toast.success('Role request accepted');
    }
  });

  const approveMutation = useMutation({
    mutationFn: ({ jobId, recruiterId }: { jobId: string; recruiterId: string }) => api.jobs.approveAccess(jobId, recruiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ['jobs_search', 'roleDropdown'] });
      toast.success('Access approved');
    }
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { data: res } = await api.upload.image(file);
      if (res.success && res.data) {
        setForm(f => ({ ...f, companyLogo: res.data!.url }));
        toast.success('Logo uploaded');
      }
    } catch (err) {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const buildSubmitBody = useCallback(() => {
    const { visa, reportsTo, interviewProcess, whatYoullDo, mustHaveText, niceToHaveText, notAFitText, experience, ...rest } = form;
    if (!publicWebsiteMode) return rest;
    const customFields = [
      { name: "What You'll Do", value: whatYoullDo.trim() },
      { name: 'Visa', value: visa.trim() },
      { name: 'Reports To', value: reportsTo.trim() },
      { name: 'Interview Process', value: interviewProcess.trim() },
      { name: 'Not a Fit', value: notAFitText.trim() },
    ].filter((f) => f.value);
    return {
      ...rest,
      requirements: mustHaveText
        ? mustHaveText.split('\n').map((s) => s.trim()).filter(Boolean)
        : rest.requirements,
      benefits: niceToHaveText
        ? niceToHaveText.split('\n').map((s) => s.trim()).filter(Boolean)
        : rest.benefits,
      customFields,
      idealCandidate: { experience: experience.trim() },
    };
  }, [form, publicWebsiteMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(s => s + 1);
      return;
    }
    if (!form.title || !form.companyName) {
      toast.error('Company and Title are required');
      return;
    }
    const body = buildSubmitBody();
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  useEffect(() => {
    const cf = (editingJob as any)?.customFields as { name: string; value: string }[] | undefined;
    const getCf = (name: string) => cf?.find((f) => f.name.toLowerCase() === name.toLowerCase())?.value ?? '';
    if (editingJob) {
      setForm({
        title: editingJob.title || '',
        companyName: editingJob.companyName || '',
        companyLogo: editingJob.companyLogo || '',
        location: editingJob.location || '',
        salary: editingJob.salary || '',
        description: editingJob.description || '',
        workplaceType: editingJob.workplaceType || 'On-site',
        status: editingJob.status || 'open',
        skills: editingJob.skills || [],
        requirements: editingJob.requirements || [],
        reward: editingJob.reward || '',
        recruiterIds: editingJob.recruiterIds || [],
        benefits: (editingJob as any).benefits || [],
        openings: editingJob.stats?.openings || 1,
        personalQuestions: (editingJob as any).personalQuestions || [],
        visa: getCf('Visa'),
        reportsTo: getCf('Reports To'),
        interviewProcess: getCf('Interview Process'),
        whatYoullDo: getCf("What You'll Do"),
        mustHaveText: (editingJob.requirements || []).join('\n'),
        niceToHaveText: ((editingJob as any).benefits || []).join('\n'),
        notAFitText: getCf('Not a Fit'),
        experience: (editingJob as any).idealCandidate?.experience || '',
        roleType: editingJob.roleType || '',
      });
    } else {
      setForm({
        title: '',
        companyName: '',
        companyLogo: '',
        location: '',
        salary: '',
        description: '',
        workplaceType: 'On-site',
        status: 'open',
        skills: [],
        requirements: [],
        reward: '',
        recruiterIds: [],
        benefits: [],
        openings: 1,
        personalQuestions: [],
        visa: '',
        reportsTo: '',
        interviewProcess: '',
        whatYoullDo: '',
        mustHaveText: '',
        niceToHaveText: '',
        notAFitText: '',
        experience: '',
        roleType: '',
      });
    }
    setCurrentStep(1);
  }, [editingJob, isDrawerOpen]);

  const items = data?.items ?? [];

  const uniqueLocations = Array.from(new Set(items.map(j => j.location).filter(Boolean))) as string[];
  const uniqueWorkplaces = Array.from(new Set(items.map(j => j.workplaceType).filter(Boolean))) as string[];
  const uniqueRoleTypes = Array.from(new Set(items.map(j => j.roleType).filter(Boolean))) as string[];

  const salaryBounds = useMemo(() => {
    const allRanges = items
      .map((j) => getSalaryRange(j.salary))
      .filter((r): r is { min: number; max: number } => !!r);

    if (allRanges.length === 0) {
      return { min: 0, max: 300000 };
    }

    return {
      min: Math.min(...allRanges.map((r) => r.min)),
      max: Math.max(...allRanges.map((r) => r.max)),
    };
  }, [items]);

  const salaryMilestones = useMemo(() => {
    const totalPoints = 4;
    const rawStep = (salaryBounds.max - salaryBounds.min) / Math.max(1, totalPoints - 1);
    const step = Math.max(10000, normalizeToStep(rawStep, 5000));

    const points = Array.from({ length: totalPoints }, (_, idx) => {
      if (idx === 0) return salaryBounds.min;
      if (idx === totalPoints - 1) return salaryBounds.max;
      return Math.min(
        salaryBounds.max,
        Math.max(salaryBounds.min, normalizeToStep(salaryBounds.min + step * idx, 5000))
      );
    });

    return Array.from(new Set(points)).sort((a, b) => a - b);
  }, [salaryBounds]);

  useEffect(() => {
    if (!salaryFilter) return;
    const clampedMin = Math.max(salaryBounds.min, Math.min(salaryFilter.min, salaryBounds.max));
    const clampedMax = Math.min(salaryBounds.max, Math.max(salaryFilter.max, salaryBounds.min));
    if (clampedMin !== salaryFilter.min || clampedMax !== salaryFilter.max) {
      setSalaryFilter({ min: Math.min(clampedMin, clampedMax), max: Math.max(clampedMin, clampedMax) });
    }
  }, [salaryBounds, salaryFilter]);

  const visibleItems = items.filter(job => {
    if (locationFilter && job.location !== locationFilter) return false;
    if (workplaceFilter && job.workplaceType !== workplaceFilter) return false;
    if (salaryFilter) {
      const jobRange = getSalaryRange(job.salary);
      if (!jobRange) return false;
      if (jobRange.max < salaryFilter.min || jobRange.min > salaryFilter.max) return false;
    }
    if (roleTypeFilter && job.roleType !== roleTypeFilter) return false;

    // Tab Logics
    if (activeTab === 'new') {
      if (Date.now() - new Date(job.createdAt || Date.now()).getTime() > 86400000 * 3) return false;
    }
    if (activeTab === 'no-interviews') {
      if (job.stats && job.stats.interviewing > 0) return false;
    }
    if (activeTab === 'multiple') {
      if (!job.stats || job.stats.openings <= 1) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      if (!job.title?.toLowerCase().includes(q) && !job.companyName?.toLowerCase().includes(q)) return false;
    }

    if (canApplyOnly && job.status !== 'open') return false;
    if (workplacePreference !== 'all' && job.workplaceType?.toLowerCase() !== workplacePreference) return false;
    if (moreFiltersOptions.minSalary100k) {
      const sal = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0', 10);
      if (sal < 100000) return false;
    }
    if (moreFiltersOptions.equity && !job.reward?.toLowerCase().includes('equity')) return false;

    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setActiveTab('qualified');
    setLocationFilter('');
    setWorkplaceFilter('');
    setSalaryFilter(null);
    setRoleTypeFilter('');
    setCanApplyOnly(false);
    setWorkplacePreference('all');
    setMoreFiltersOptions({ minSalary100k: false, equity: false });
  };

  const toggleRecruiter = (rid: string) => {
    setForm(f => ({
      ...f,
      recruiterIds: f.recruiterIds.includes(rid)
        ? f.recruiterIds.filter(id => id !== rid)
        : [...f.recruiterIds, rid]
    }));
  };

  const addBenefit = (benefit: string) => {
    if (benefit && !form.benefits.includes(benefit)) {
      setForm(f => ({ ...f, benefits: [...f.benefits, benefit] }));
    }
  };

  const removeBenefit = (benefit: string) => {
    setForm(f => ({ ...f, benefits: f.benefits.filter(b => b !== benefit) }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm(f => ({ ...f, skills: [...f.skills, trimmed] }));
    }
  };

  const removeSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const addQuestion = () => {
    setForm(f => ({ ...f, personalQuestions: [...f.personalQuestions, { question: '', required: false }] }));
  };

  const updateQuestion = (idx: number, question: string) => {
    const qs = [...form.personalQuestions];
    qs[idx].question = question;
    setForm(f => ({ ...f, personalQuestions: qs }));
  };

  const removeQuestion = (idx: number) => {
    setForm(f => ({ ...f, personalQuestions: f.personalQuestions.filter((_, i) => i !== idx) }));
  };

  const toggleQuestionRequired = (idx: number) => {
    const qs = [...form.personalQuestions];
    qs[idx] = { ...qs[idx], required: !qs[idx].required };
    setForm(f => ({ ...f, personalQuestions: qs }));
  };

  const applyParsedJd = useCallback((parsed: ParsedJobFields) => {
    setForm((f) => ({
      ...f,
      title: parsed.title || f.title,
      companyName: parsed.companyName || f.companyName,
      location: parsed.location || f.location,
      salary: parsed.salary || f.salary,
      description: parsed.description || f.description,
      workplaceType: parsed.workplaceType || f.workplaceType,
      roleType: parsed.roleType || f.roleType,
      experience: parsed.experience || f.experience,
      visa: parsed.visa || f.visa,
      reportsTo: parsed.reportsTo || f.reportsTo,
      interviewProcess: parsed.interviewProcess || f.interviewProcess,
      whatYoullDo: parsed.whatYoullDo || f.whatYoullDo,
      mustHaveText: parsed.mustHaveText || f.mustHaveText,
      niceToHaveText: parsed.niceToHaveText || f.niceToHaveText,
      notAFitText: parsed.notAFitText || f.notAFitText,
      skills: parsed.skills.length
        ? [...new Set([...f.skills, ...parsed.skills])]
        : f.skills,
      requirements: parsed.mustHaveText
        ? parsed.mustHaveText.split('\n').map((s) => s.trim()).filter(Boolean)
        : f.requirements,
      benefits: parsed.niceToHaveText
        ? parsed.niceToHaveText.split('\n').map((s) => s.trim()).filter(Boolean)
        : f.benefits,
    }));
  }, []);

  const publicFormProps = {
    form,
    setForm,
    uploadingLogo,
    onLogoUpload: handleLogoUpload,
    addSkill,
    removeSkill,
    addQuestion,
    updateQuestion,
    removeQuestion,
    toggleQuestionRequired,
    onJdImport: applyParsedJd,
  };

  return (
    <RouteGuard allowedRoles={publicWebsiteMode ? ['admin'] : ['admin', 'recruiter']}>
      <div className="mx-auto w-full min-w-0 max-w-[1200px] px-3 pb-20 sm:px-6">

        {publicWebsiteMode && (
          <div className="mt-4 sm:mt-6 mb-2 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Public Website</p>
                  <p className="text-xs text-emerald-800/80 sm:text-sm">
                    Jobs posted here with status <strong>Open</strong> appear on{' '}
                    <span className="font-semibold">quoreit.com/open-jobs</span>.
                    <strong className="block mt-1">Company name & logo are internal only — never shown on the public site.</strong>
                  </p>
                </div>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL
                  ? `${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL.replace(/\/$/, '')}/open-jobs`
                  : 'http://localhost:3002/open-jobs'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:text-sm"
              >
                View live page
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6 flex min-w-0 flex-col justify-between gap-5 pt-4 sm:mb-8 sm:flex-row sm:items-start sm:gap-6 sm:pt-6">
          <div className="relative min-w-0 flex-1">
            <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:pr-4">
              <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                {publicWebsiteMode ? 'Public Jobs' : 'Browse for roles'}
              </h1>

              <div className="flex shrink-0 items-center gap-4 sm:mt-0">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { setEditingJob(null); setIsDrawerOpen(true); }}
                    className={`group flex w-full touch-manipulation items-center justify-center gap-2.5 rounded-full px-6 py-3 text-white shadow-xl transition-all active:scale-[0.98] sm:w-fit sm:px-7 ${
                      publicWebsiteMode
                        ? 'bg-emerald-600 shadow-emerald-500/25 hover:bg-emerald-700 hover:shadow-emerald-500/35'
                        : 'bg-blue-600 shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35'
                    }`}
                  >
                    <Plus className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-90 ${publicWebsiteMode ? 'text-emerald-100' : 'text-blue-100'}`} />
                    <span className="text-[14px] font-black tracking-tight">
                      {publicWebsiteMode ? 'Post Public Job' : 'Post Role'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {!publicWebsiteMode && (
            <div className="mt-6 flex min-w-0 max-w-full touch-pan-x snap-x snap-mandatory items-center gap-4 overflow-x-auto pb-2 italic [-webkit-overflow-scrolling:touch] sm:mt-8 sm:gap-8 md:gap-10 sm:snap-none">
              {[
                { id: 'qualified', label: 'Qualified roles', icon: CheckCircle2, meta: 'Beta' },
                { id: 'new', label: 'New', icon: Sparkles },
                { id: 'responsive', label: 'Responsive', icon: Video },
                { id: 'no-interviews', label: 'No interviews', icon: FileText },
                { id: 'no-final', label: 'No final rounds', icon: Target },
                { id: 'multiple', label: 'Multiple openings', icon: Building2 },
                { id: 'bonus', label: 'Role bonus', icon: DollarSign },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`relative flex shrink-0 snap-start flex-col items-center gap-2 pb-4 transition-all sm:gap-3 ${activeTab === cat.id ? 'font-bold text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <cat.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${activeTab === cat.id ? 'text-gray-900' : 'text-gray-300'}`} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-[14px] whitespace-nowrap">{cat.label}</span>
                    {cat.meta && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-bold rounded">
                        {cat.meta}
                      </span>
                    )}
                  </div>
                  {activeTab === cat.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 min-w-0 space-y-4">
          <div className="group relative min-w-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-5" />
            <input
              type="search"
              enterKeyHint="search"
              placeholder="Search roles, companies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full min-w-0 max-w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-[15px] shadow-sm outline-none transition-all focus:ring-1 focus:ring-gray-300 sm:py-3.5 sm:pl-12 sm:pr-4 sm:text-[15px]"
            />
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 pb-1 md:flex-nowrap md:gap-2 md:overflow-x-auto md:pb-2 md:[-webkit-overflow-scrolling:touch]">
            {[
              { name: 'Location', state: locationFilter, set: setLocationFilter, options: uniqueLocations },
              { name: 'Workplace', state: workplaceFilter, set: setWorkplaceFilter, options: uniqueWorkplaces },
              { name: 'Role type', state: roleTypeFilter, set: setRoleTypeFilter, options: uniqueRoleTypes },
            ].map((f) => (
              <div key={f.name} className="relative">
                <button
                  onClick={(e) => {
                    const next = openDropdown === f.name ? null : f.name;
                    setOpenDropdown(next);
                    if (next) {
                      openResponsiveDropdown(e, Math.max(180, e.currentTarget.getBoundingClientRect().width));
                    } else {
                      setDropdownRect(null);
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 hover:bg-white rounded-xl text-xs sm:text-[13px] font-medium inline-flex items-center gap-2 border transition-all flex-shrink-0 whitespace-nowrap ${f.state || openDropdown === f.name
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50/50 text-gray-500 border-transparent hover:border-gray-200'
                    }`}
                >
                  {f.state ? f.state : f.name} <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
                {openDropdown === f.name && dropdownRect &&
                  createPortal(
                    <div
                      className="fixed bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-150 origin-top"
                      style={{ left: dropdownRect.left, top: dropdownRect.top, width: dropdownRect.width, maxHeight: dropdownRect.maxHeight }}
                    >
                      <div className="max-h-full overflow-y-auto">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => { f.set(''); setOpenDropdown(null); setDropdownRect(null); }}
                        >
                          Clear
                        </button>
                        {f.options.map(opt => (
                          <button
                            key={opt}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => { f.set(opt); setOpenDropdown(null); setDropdownRect(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            ))}

            <div className="relative">
              <button
                onClick={(e) => {
                  const next = openDropdown === 'salary' ? null : 'salary';
                  setOpenDropdown(next);
                  if (next) {
                    openResponsiveDropdown(e, 320);
                  } else {
                    setDropdownRect(null);
                  }
                }}
                className={`inline-flex max-w-full min-w-0 flex-shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-white sm:px-4 sm:text-[13px] ${salaryFilter || openDropdown === 'salary'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-transparent bg-gray-50/50 text-gray-500 hover:border-gray-200'
                  }`}
              >
                <span className="min-w-0 flex-1 truncate">
                  {salaryFilter
                    ? `${formatSalaryLabel(salaryFilter.min)} - ${formatSalaryLabel(salaryFilter.max)}`
                    : 'Salary'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </button>
              {openDropdown === 'salary' && dropdownRect &&
                createPortal(
                  <div
                    className="fixed bg-white border border-gray-100 shadow-xl rounded-2xl overflow-y-auto z-[9999] px-3 pb-3 pt-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top"
                    style={{ left: dropdownRect.left, top: dropdownRect.top, width: dropdownRect.width, maxHeight: dropdownRect.maxHeight }}
                  >
                    {(() => {
                      const currentMin = salaryFilter?.min ?? salaryBounds.min;
                      const currentMax = salaryFilter?.max ?? salaryBounds.max;
                      const minPercent = ((currentMin - salaryBounds.min) / Math.max(1, salaryBounds.max - salaryBounds.min)) * 100;
                      const maxPercent = ((currentMax - salaryBounds.min) / Math.max(1, salaryBounds.max - salaryBounds.min)) * 100;
                      const innerMilestones = salaryMilestones.slice(1, -1);
                      const sliderStep = 5000;

                      return (
                        <>
                          <div className="relative h-9 mb-1.5">
                            <div className="absolute left-0 right-0 top-4 h-[2px] bg-gray-300 rounded-full" />
                            <div
                              className="absolute top-[15px] h-[2px] bg-blue-500 rounded-full"
                              style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}
                            />
                            <div className="absolute top-2.5 left-0 w-3 h-3 rounded-full bg-black" />
                            <div className="absolute top-2.5 right-0 w-3 h-3 rounded-full bg-black" />
                            {innerMilestones.map((point) => {
                              const pointPercent = ((point - salaryBounds.min) / Math.max(1, salaryBounds.max - salaryBounds.min)) * 100;
                              return (
                                <button
                                  key={`point-${point}`}
                                  type="button"
                                  onMouseDown={(ev) => ev.preventDefault()}
                                  onClick={() => {
                                    const distToMin = Math.abs(point - currentMin);
                                    const distToMax = Math.abs(point - currentMax);
                                    if (distToMin <= distToMax) {
                                      setSalaryFilter({ min: Math.min(point, currentMax), max: currentMax });
                                    } else {
                                      setSalaryFilter({ min: currentMin, max: Math.max(point, currentMin) });
                                    }
                                  }}
                                  className="absolute top-[13px] w-2.5 h-2.5 -translate-x-1/2 rounded-full border border-blue-500 bg-white hover:bg-blue-50 transition-colors"
                                  style={{ left: `${pointPercent}%` }}
                                />
                              );
                            })}
                            <input
                              type="range"
                              min={salaryBounds.min}
                              max={salaryBounds.max}
                              step={sliderStep}
                              value={currentMin}
                              onChange={(e) => {
                                const nextMin = Number(e.target.value);
                                setSalaryFilter({ min: Math.min(nextMin, currentMax), max: currentMax });
                              }}
                              className="absolute w-full h-8 top-0 bg-transparent appearance-none cursor-pointer opacity-0"
                            />
                            <input
                              type="range"
                              min={salaryBounds.min}
                              max={salaryBounds.max}
                              step={sliderStep}
                              value={currentMax}
                              onChange={(e) => {
                                const nextMax = Number(e.target.value);
                                setSalaryFilter({ min: currentMin, max: Math.max(nextMax, currentMin) });
                              }}
                              className="absolute w-full h-8 top-0 bg-transparent appearance-none cursor-pointer opacity-0"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[11px] sm:text-[13px] text-gray-900 font-semibold leading-none mb-2.5">
                            {salaryMilestones.map((point) => (
                              <span key={`label-${point}`} className="text-center">
                                {formatSalaryLabel(point)}
                              </span>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 pt-2.5" />
                          <div className="flex items-center justify-between text-[13px] text-gray-500 font-semibold mb-2">
                            <span>Min (k)</span>
                            <span>Max (k)</span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2.5">
                            <input
                              value={Math.round(currentMin / 1000)}
                              onChange={(e) => {
                                const next = Number(e.target.value || 0) * 1000;
                                const normalized = Math.max(salaryBounds.min, Math.min(next, currentMax));
                                setSalaryFilter({ min: normalized, max: currentMax });
                              }}
                              className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-[14px] sm:text-[15px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <span className="text-gray-400 font-semibold text-[16px]">-</span>
                            <input
                              value={Math.round(currentMax / 1000)}
                              onChange={(e) => {
                                const next = Number(e.target.value || 0) * 1000;
                                const normalized = Math.min(salaryBounds.max, Math.max(next, currentMin));
                                setSalaryFilter({ min: currentMin, max: normalized });
                              }}
                              className="w-full px-3 py-2 rounded-2xl border border-gray-200 text-[14px] sm:text-[15px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <button
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => setSalaryFilter(null)}
                            >
                              Clear
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => { setOpenDropdown(null); setDropdownRect(null); }}
                            >
                              Apply
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>,
                  document.body
                )}
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  const next = openDropdown === 'preferences' ? null : 'preferences';
                  setOpenDropdown(next);
                  if (next) {
                    openResponsiveDropdown(e, 240);
                  } else {
                    setDropdownRect(null);
                  }
                }}
                className={`px-3 sm:px-4 py-2 hover:bg-white rounded-xl text-xs sm:text-[13px] font-medium inline-flex items-center gap-2 border transition-all flex-shrink-0 whitespace-nowrap ${workplacePreference !== 'all' || openDropdown === 'preferences'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50/50 text-gray-500 border-transparent hover:border-gray-200'
                  }`}
              >
                My preferences <Edit2 className="w-3 h-3" />
              </button>
              {openDropdown === 'preferences' && dropdownRect &&
                createPortal(
                  <div
                    className="fixed bg-white border border-gray-100 shadow-xl rounded-xl overflow-y-auto z-[9999] p-2 animate-in fade-in zoom-in-95 duration-150 origin-top"
                    style={{ left: dropdownRect.left, top: dropdownRect.top, width: dropdownRect.width, maxHeight: dropdownRect.maxHeight }}
                  >
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'remote', label: 'Remote' },
                      { id: 'on-site', label: 'On-site' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setWorkplacePreference(option.id as 'all' | 'remote' | 'on-site')}
                        className={`w-full flex items-center justify-between px-2 py-2 rounded text-sm transition-colors ${workplacePreference === option.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>{option.label}</span>
                        <span className={`w-4 h-4 rounded-full border ${workplacePreference === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`} />
                      </button>
                    ))}
                    <button onClick={() => { setOpenDropdown(null); setDropdownRect(null); }} className="w-full mt-2 bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold">Done</button>
                  </div>,
                  document.body
                )}
            </div>

            <button
              onClick={() => setCanApplyOnly(!canApplyOnly)}
              className={`px-3 sm:px-4 py-2 rounded-xl border transition-all text-xs sm:text-[13px] font-medium inline-flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${canApplyOnly
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50/50 hover:bg-white text-gray-500 border-transparent hover:border-gray-200'
                }`}
            >
              Can apply
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  const next = openDropdown === 'more_filters' ? null : 'more_filters';
                  setOpenDropdown(next);
                  if (next) {
                    openResponsiveDropdown(e, 240);
                  } else {
                    setDropdownRect(null);
                  }
                }}
                className={`px-3 sm:px-4 py-2 hover:bg-white rounded-xl text-xs sm:text-[13px] font-medium inline-flex items-center gap-2 border transition-all flex-shrink-0 whitespace-nowrap ${Object.values(moreFiltersOptions).some(Boolean) || openDropdown === 'more_filters'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50/50 text-gray-500 border-transparent hover:border-gray-200'
                  }`}
              >
                More filters +
              </button>
              {openDropdown === 'more_filters' && dropdownRect &&
                createPortal(
                  <div
                    className="fixed bg-white border border-gray-100 shadow-xl rounded-xl overflow-y-auto z-[9999] p-2 animate-in fade-in zoom-in-95 duration-150 origin-top"
                    style={{ left: dropdownRect.left, top: dropdownRect.top, width: dropdownRect.width, maxHeight: dropdownRect.maxHeight }}
                  >
                  <label className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={moreFiltersOptions.minSalary100k} onChange={e => setMoreFiltersOptions(m => ({ ...m, minSalary100k: e.target.checked }))} className="rounded text-blue-600 focus:ring-blue-500" />
                    $100k+ Salary
                  </label>
                  <label className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={moreFiltersOptions.equity} onChange={e => setMoreFiltersOptions(m => ({ ...m, equity: e.target.checked }))} className="rounded text-blue-600 focus:ring-blue-500" />
                    Equity Included
                  </label>
                  <button onMouseDown={(ev) => ev.preventDefault()} onClick={() => { setOpenDropdown(null); setDropdownRect(null); }} className="w-full mt-2 bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold">Apply</button>
                  </div>,
                  document.body
                )}
            </div>
            <button
              onClick={clearFilters}
              className="px-3 sm:px-4 py-2 text-rose-500 font-bold hover:bg-rose-50 rounded-xl text-xs sm:text-[13px] flex-shrink-0 whitespace-nowrap"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="mb-6 min-w-0 font-medium">
          <p className="text-[13px] italic tracking-tight text-gray-500 sm:text-[14px]">
            Sort:{' '}
            <span className="cursor-pointer font-bold text-gray-900 hover:underline">Recommended</span>
          </p>
        </div>

        {/* Pending Requests for Admin */}
        {isAdmin && visibleItems.some(job => job.recruiterAssignments?.some((a: any) => a.status === 'requested')) && (
          <div className="mb-10 space-y-4">
            <h2 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Access Requests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleItems.map(job => (job.recruiterAssignments || [])
                .filter((a: any) => a.status === 'requested')
                .map((a: any, i) => (
                  <div key={`${job.id}-${a.recruiterId}-${i}`} className="bg-white border-2 border-orange-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center font-bold text-orange-600">
                        {a.recruiterName?.[0] || 'R'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{a.recruiterName || 'Assignee'}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase truncate w-32">{job.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); approveMutation.mutate({ jobId: job.id, recruiterId: a.recruiterId }); }}
                      disabled={approveMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {approveMutation.isPending ? 'Working' : 'Approve'} <Check className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="min-w-0 space-y-4">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent animate-spin rounded-full" />
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-[0.1em] text-xs transition-all">No roles match your filters</p>
            </div>
          ) : (
            visibleItems.map((job) => {
              const myAssignment = job.recruiterAssignments?.find((a: any) => String(a.recruiterId) === String(user?.id));
              const isPending = isRecruiter && (myAssignment as any)?.status === 'pending';
              const isRequested = isRecruiter && (myAssignment as any)?.status === 'requested';
              const myAcceptedAt = isRecruiter && myAssignment?.status === 'accepted' ? (myAssignment as any).acceptedAt : null;
              const adminAcceptedAssignments = isAdmin ? (job.recruiterAssignments?.filter((a: any) => a.status === 'accepted') || []) : [];

              return (
                <div
                  key={job.id}
                  onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  className="group bg-white border border-gray-200 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer hover:border-gray-300 hover:shadow-lg hover:shadow-gray-400/10 transition-all relative overflow-hidden"
                >
                  {isPending && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 sm:px-6 py-1 sm:py-1.5 rounded-bl-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Action Required
                    </div>
                  )}
                  {isRequested && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 sm:px-6 py-1 sm:py-1.5 rounded-bl-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Waiting for Admin
                    </div>
                  )}

                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-4 sm:flex-row">
                    <div className="min-w-0 space-y-2 pt-1">
                      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                        <h3 className="break-words text-[16px] font-semibold lowercase leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-blue-600 sm:text-[18px] md:text-[20px]">
                          {job.companyName} • {job.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                          Qualified
                        </span>
                        {myAcceptedAt && (
                          <span className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-semibold">
                            Accepted: {new Date(myAcceptedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {isAdmin && adminAcceptedAssignments.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {adminAcceptedAssignments.map((a: any, idx) => a.acceptedAt && (
                              <span key={idx} className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-semibold">
                                Accepted: {new Date(a.acceptedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex max-w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-gray-500">
                        <span className="max-w-full truncate">{job.salary}</span>
                        <span className="hidden text-gray-200 sm:inline">|</span>
                        <span className="max-w-full truncate">{job.location}</span>
                        <span className="hidden text-gray-200 sm:inline">|</span>
                        <span className="max-w-full truncate">{job.workplaceType}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1">
                        <p className="text-sm text-gray-500 font-semibold tabular-nums">{(job.stats as any)?.openings || 1} opening</p>
                        <p className="text-sm text-gray-500 font-semibold tabular-nums">{(job.stats as any)?.interviewing || 0} interviewing</p>
                        <p className="text-sm text-emerald-600 font-semibold tabular-nums">{(job.stats as any)?.activeRecruiters || 0} active recruiters</p>
                      </div>
                      {isPending ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); acceptMutation.mutate(job.id); }}
                          className="mt-3 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0 w-full sm:w-fit justify-center"
                        >
                          Accept Strategy <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : isRequested ? (
                        <button
                          disabled
                          className="mt-3 px-6 py-2 bg-gray-200 text-gray-500 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-2 shrink-0 w-full sm:w-fit justify-center"
                        >
                          Request Pending
                        </button>
                      ) : (!myAssignment && isRecruiter) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            api.jobs.requestAccess(job.id).then(() => {
                              toast.success('Access requested pending admin approval');
                              queryClient.invalidateQueries({ queryKey: ['jobs'] });
                            }).catch(() => toast.error('Failed to request access'));
                          }}
                          className="mt-3 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0 w-full sm:w-fit justify-center"
                        >
                          Request Access <Plus className="w-3.5 h-3.5" />
                        </button>
                      ) : job.reward && (
                        <div className="text-[11px] sm:text-[12px] font-bold text-gray-700 pt-2 flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                          {job.reward} salary + bonus
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right pt-1 pr-2 w-full sm:w-auto mt-2 sm:mt-0 flex flex-col items-end">
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingJob(job);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit Role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(job);
                            }}
                            className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-all"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4-Step Job Posting Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={publicWebsiteMode
            ? (editingJob ? 'Edit public job' : 'Post public job')
            : (editingJob ? 'Refine Strategy' : 'Post New Opening')}
          fromRight={true}
          className={publicWebsiteMode ? 'w-full sm:max-w-[480px]' : 'w-full sm:max-w-[420px]'}
        >
          {publicWebsiteMode ? (
          <div className="flex h-full flex-col -mx-1">
            {/* Step progress */}
            <div className="mb-6 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-1">
                {PUBLIC_FORM_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const active = currentStep === step.id;
                  const done = currentStep > step.id;
                  return (
                    <div key={step.id} className="flex flex-1 items-center gap-1">
                      <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                            active
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                              : done
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                        </div>
                        <span className={`hidden text-center text-[10px] font-semibold sm:block ${active ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < PUBLIC_FORM_STEPS.length - 1 && (
                        <div className={`mb-5 h-0.5 flex-1 rounded-full ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-gray-500 sm:hidden">
                Step {currentStep} of 4 — {PUBLIC_FORM_STEPS[currentStep - 1]?.label}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 pb-4">
                {currentStep === 1 && <PublicJobStep1 {...publicFormProps} />}
                {currentStep === 2 && <PublicJobStep2 {...publicFormProps} />}
                {currentStep === 3 && <PublicJobStep3 {...publicFormProps} />}
                {currentStep === 4 && <PublicJobStep4 {...publicFormProps} />}
              </div>

              <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white/95 py-4 backdrop-blur-sm">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-[2] rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving…'
                    : currentStep < 4
                      ? 'Continue'
                      : editingJob
                        ? 'Update & publish'
                        : 'Publish to open-jobs'}
                </button>
              </div>
            </form>
          </div>
          ) : (
          <div className="h-full flex flex-col no-scrollbar">
            <div className="mb-4 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-1 flex-col gap-1">
                  <div className={`h-1 rounded-full ${currentStep >= s ? 'bg-blue-600' : 'bg-gray-100'}`} />
                  <span className={`text-[9px] font-semibold uppercase ${currentStep === s ? 'text-blue-600' : 'text-gray-300'}`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 pb-2">

                {currentStep === 1 && (
                  <div className="space-y-3 animate-in slide-in-from-right-3 duration-300">
                    <JdPdfImport onApply={applyParsedJd} accent="blue" />

                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-dashed border-gray-200 bg-white">
                        {form.companyLogo ? (
                          <img src={form.companyLogo} alt="" className="h-full w-full object-contain p-2" />
                        ) : uploadingLogo ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <Camera className="h-5 w-5" />
                          </div>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </div>
                      <p className="text-[11px] leading-snug text-gray-500">Optional company logo for internal CRM</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Title *</label>
                        <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15" placeholder="Lead Developer" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Company *</label>
                        <input required value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15" placeholder="Partner name" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Location</label>
                        <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15" placeholder="Remote / NYC" list="job-locations-list" />
                        <datalist id="job-locations-list">{uniqueLocations.map((loc) => <option key={loc} value={loc} />)}</datalist>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Salary</label>
                        <input value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15" placeholder="$120k – $160k" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 items-end">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Openings</label>
                        <input type="number" min={1} required value={form.openings} onChange={(e) => setForm((f) => ({ ...f, openings: parseInt(e.target.value, 10) || 1 }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Workplace</label>
                        <div className="flex h-10 rounded-lg border border-gray-200 bg-white p-0.5">
                          {['On-site', 'Remote', 'Hybrid'].map((type) => (
                            <button key={type} type="button" onClick={() => setForm((f) => ({ ...f, workplaceType: type }))} className={`flex-1 rounded-md text-[10px] font-semibold ${form.workplaceType === type ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Incentives */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2"><DollarSign className="w-3 h-3 text-emerald-500" /> Strategic Reward</label>
                      <div className="relative group">
                        <input
                          value={form.reward}
                          onChange={e => setForm(f => ({ ...f, reward: e.target.value }))}
                          className="w-full pl-12 pr-5 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-[15px] font-black text-gray-900 focus:bg-white focus:border-emerald-500/30 outline-none transition-all shadow-sm focus:shadow-md"
                          placeholder="e.g. 20% First Year Success Fee"
                        />
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold italic ml-2">Define the incentive for successful placement</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-50">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-blue-500" /> Executive Perks & Benefits
                      </label>
                      <div className="flex flex-wrap gap-2.5 min-h-2">
                        {form.benefits.length === 0 && <p className="text-[11px] text-gray-300 font-bold py-2 px-1">No perks added yet...</p>}
                        {form.benefits.map((b, i) => (
                          <span key={i} className="px-5 py-2.5 bg-blue-50/50 text-blue-700 rounded-full text-[11px] font-black flex items-center gap-3 border border-blue-100/50 animate-in zoom-in-95 duration-300">
                            {b}
                            <button type="button" onClick={() => removeBenefit(b)} className="text-blue-300 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5 stroke-[3]" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="relative mt-4">
                        <input
                          id="benefit-input"
                          className="w-full pl-6 pr-14 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-blue-500/30 transition-all shadow-sm"
                          placeholder="Add a perk (e.g. Health Insurance, Equity)"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              addBenefit(input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('benefit-input') as HTMLInputElement;
                            if (input.value) { addBenefit(input.value); input.value = ''; }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Mission & Screening */}
                {currentStep === 3 && (
                  <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-blue-600" /> Strategic Mission</label>
                      <div className="relative bg-gray-50/50 rounded-[2rem] border border-gray-100 p-1 focus-within:bg-white focus-within:border-blue-500/30 transition-all shadow-sm focus-within:shadow-md">
                        <textarea
                          rows={8}
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full p-6 bg-transparent text-[15px] font-medium leading-relaxed resize-none outline-none scrollbar-thin"
                          placeholder="Describe the mandate, core expectations, and the impact this role will have..."
                        />
                      </div>
                    </div>

                    {publicWebsiteMode && (
                      <div className="space-y-6 pt-6 border-t border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Public JD format (shown on open-jobs)</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</label>
                            <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" placeholder="e.g. 3+ years B2B" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visa</label>
                            <input value={form.visa} onChange={e => setForm(f => ({ ...f, visa: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" placeholder="e.g. Not available" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reports to</label>
                            <input value={form.reportsTo} onChange={e => setForm(f => ({ ...f, reportsTo: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" placeholder="e.g. Founder" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Interview process</label>
                            <input value={form.interviewProcess} onChange={e => setForm(f => ({ ...f, interviewProcess: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" placeholder="e.g. 3-step process" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">What you&apos;ll do (one block per paragraph, title on first line)</label>
                          <textarea rows={6} value={form.whatYoullDo} onChange={e => setForm(f => ({ ...f, whatYoullDo: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" placeholder="Pipeline Generation&#10;Build and execute lead gen..." />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Must have (one per line)</label>
                          <textarea rows={5} value={form.mustHaveText} onChange={e => setForm(f => ({ ...f, mustHaveText: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nice to have (one per line)</label>
                          <textarea rows={3} value={form.niceToHaveText} onChange={e => setForm(f => ({ ...f, niceToHaveText: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Not a fit if (one per line)</label>
                          <textarea rows={3} value={form.notAFitText} onChange={e => setForm(f => ({ ...f, notAFitText: e.target.value }))} className="w-full mt-1 px-4 py-3 border rounded-xl text-sm" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-6 pt-8 border-t border-gray-50">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Intelligence Screening
                        </label>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          + NEW QUESTION
                        </button>
                      </div>

                      <div className="space-y-4">
                        {form.personalQuestions.length === 0 ? (
                          <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center bg-gray-50/30">
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] italic leading-relaxed opacity-60">No screening questions<br />defined for this role</p>
                          </div>
                        ) : (
                          form.personalQuestions.map((q, i) => (
                            <div key={i} className="flex gap-3 animate-in slide-in-from-top-4 duration-500 group">
                              <div className="flex-1 flex items-center gap-4 bg-white border border-gray-100 rounded-3xl px-6 py-1 shadow-sm group-hover:shadow-md group-hover:border-blue-100 transition-all">
                                <span className="text-[14px] font-black text-blue-600 tabular-nums opacity-40">0{i + 1}</span>
                                <input
                                  value={q.question}
                                  onChange={e => updateQuestion(i, e.target.value)}
                                  className="flex-1 py-4 bg-transparent text-[14px] font-bold text-gray-900 outline-none"
                                  placeholder="e.g. Describe your experience with LLM orchestration..."
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQuestion(i)}
                                className="w-14 h-14 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-[1.5rem] transition-all flex items-center justify-center shadow-sm hover:shadow-rose-500/20 active:scale-90"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Engagement */}
                {currentStep === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="px-1">
                      <h3 className="text-[15px] font-black text-gray-900 mb-1 flex items-center gap-2 uppercase tracking-tight">Strategic Partners <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /></h3>
                      <p className="text-xs text-gray-400 font-bold">Involve elite recruiters to drive this mandate to closure.</p>
                    </div>
                    <div className="space-y-4">
                      {recruiters.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center bg-gray-50/30">
                          <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                          <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest opacity-60 italic">No partners available</p>
                        </div>
                      ) : (
                        recruiters.map((rec) => (
                          <div
                            key={rec.id}
                            onClick={() => toggleRecruiter(rec.id)}
                            className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group ${form.recruiterIds.includes(rec.id) ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 hover:border-blue-100 bg-white shadow-sm hover:shadow-md'}`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-colors duration-300 ${form.recruiterIds.includes(rec.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                {rec.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                <p className={`text-[15px] font-black tracking-tight ${form.recruiterIds.includes(rec.id) ? 'text-blue-900' : 'text-gray-900'}`}>{rec.name || 'Anonymous Partner'}</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${form.recruiterIds.includes(rec.id) ? 'bg-blue-400' : 'bg-gray-300'}`} />
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rec.email}</p>
                                </div>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${form.recruiterIds.includes(rec.id) ? 'bg-blue-600 text-white rotate-0' : 'bg-gray-50 text-transparent -rotate-90 opacity-0 group-hover:opacity-100'}`}>
                              <Check className="w-4 h-4 stroke-[4]" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>

              <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-gray-100 bg-white/95 py-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => s - 1)}
                    className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] h-10 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {currentStep < 4 ? 'Continue' : editingJob ? 'Update job' : 'Publish job'}
                </button>
              </div>
            </form>
          </div>
          )}
        </Drawer>

        {/* Simplified Delete Confirm */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Position"
        >
          <div className="p-8 space-y-8">
            <p className="text-center font-medium text-gray-600">Are you sure you want to delete the <span className="text-gray-900 font-bold">"{deleteConfirm?.title}"</span> position? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
              <button onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)} className="flex-1 py-4 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/10">Delete Position</button>
            </div>
          </div>
        </Modal>

      </div>
    </RouteGuard>
  );
}
