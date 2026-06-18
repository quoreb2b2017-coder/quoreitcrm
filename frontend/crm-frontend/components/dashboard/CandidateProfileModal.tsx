/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Plus, Edit2 } from 'lucide-react';
import { CandidateActivityPanel } from '../activity/CandidateActivityPanel';
import { CandidateCallsPanel } from '../activity/CandidateCallsPanel';
import { EmailDrawer } from '../activity/EmailDrawer';
import { FollowUpDrawer } from '../activity/FollowUpDrawer';
import { Toast } from '../ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

type CandidateProfileModalProps = {
  candidateId: string | null;
  onClose: () => void;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function LinkedInIcon() {
  return (
    <svg className="h-[14px] w-[14px] shrink-0 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg className="h-[14px] w-[14px] shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-[14px] w-[14px] shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-[14px] w-[14px] text-gray-400 -mt-0.5 cursor-pointer hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const TABS = [
  { name: 'Overview', icon: null },
  { name: 'Activity', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { name: 'Calls', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
  { name: 'LinkedIn', icon: <LinkedInIcon /> },
  { name: 'Resume', icon: null },
  { name: 'Emails', icon: null },
];

const CANDIDATE_STATUS_OPTIONS = [
  'Sourced',
  'Contacted',
  'Replied',
  'Scheduled Call',
  'Screened',
  'Active',
  'Backburner',
  'Warm In Touch',
  'In Play',
  'Highly Rated',
  'Likely to Respond',
  'Expressed Interest',
] as const;

function getStatusColorClasses(status?: string) {
  const s = String(status ?? '').toLowerCase();
  if (s.includes('contact')) return { dot: 'bg-red-500', text: 'text-red-500' };
  if (s.includes('replied')) return { dot: 'bg-emerald-500', text: 'text-emerald-600' };
  if (s.includes('scheduled') || s.includes('call')) return { dot: 'bg-blue-500', text: 'text-blue-600' };
  if (s.includes('screened')) return { dot: 'bg-indigo-500', text: 'text-indigo-600' };
  if (s.includes('backburner')) return { dot: 'bg-gray-500', text: 'text-gray-600' };
  if (s.includes('warm') || s.includes('touch') || s.includes('play') || s === 'active') {
    return { dot: 'bg-emerald-500', text: 'text-emerald-600' };
  }
  if (s.includes('highly') || s.includes('rated')) return { dot: 'bg-amber-500', text: 'text-amber-700' };
  if (s.includes('likely') || s.includes('respond')) return { dot: 'bg-indigo-500', text: 'text-indigo-600' };
  if (s.includes('interest')) return { dot: 'bg-teal-500', text: 'text-teal-600' };
  if (s.includes('sourced')) return { dot: 'bg-amber-500', text: 'text-amber-600' };
  return { dot: 'bg-gray-400', text: 'text-gray-600' };
}

function getStatusMeta(status?: string) {
  const s = String(status ?? '').toLowerCase();
  if (s.includes('contact')) return { icon: 'phone', pill: 'bg-red-50 text-red-700 border-red-100' };
  if (s.includes('replied')) return { icon: 'reply', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  if (s.includes('scheduled') || s.includes('call')) return { icon: 'calendar', pill: 'bg-blue-50 text-blue-700 border-blue-100' };
  if (s.includes('screened')) return { icon: 'check', pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
  if (s.includes('backburner')) return { icon: 'pause', pill: 'bg-gray-100 text-gray-700 border-gray-200' };
  if (s.includes('warm') || s.includes('touch') || s.includes('play') || s === 'active') return { icon: 'spark', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  if (s.includes('highly') || s.includes('rated')) return { icon: 'star', pill: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (s.includes('likely') || s.includes('respond')) return { icon: 'bolt', pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
  if (s.includes('interest')) return { icon: 'heart', pill: 'bg-teal-50 text-teal-700 border-teal-100' };
  if (s.includes('sourced')) return { icon: 'search', pill: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { icon: 'dot', pill: 'bg-gray-50 text-gray-700 border-gray-200' };
}

function StatusOptionIcon({ kind }: { kind: string }) {
  if (kind === 'phone') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
  if (kind === 'reply') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h7a4 4 0 014 4v7m0 0l-3-3m3 3l3-3M7 7l-4 3 4 3V7z" /></svg>;
  if (kind === 'calendar') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (kind === 'check') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
  if (kind === 'pause') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 7v10m4-10v10" /></svg>;
  if (kind === 'spark') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>;
  if (kind === 'star') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.366-2.447a1 1 0 00-1.176 0l-3.366 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.959a1 1 0 00-.364-1.118L2.463 9.386c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.285-3.959z" /></svg>;
  if (kind === 'bolt') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>;
  if (kind === 'heart') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
  if (kind === 'search') return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.7-4.8a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg>;
  return <span className="h-2 w-2 rounded-full bg-current" />;
}

export function CandidateProfileModal({ candidateId, onClose }: CandidateProfileModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const queryClient = useQueryClient();
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [debouncedRoleSearch, setDebouncedRoleSearch] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'Details' | 'Private notes'>('Details');
  const [newNote, setNewNote] = useState('');
  const [internalNotes, setInternalNotes] = useState<{ id: number, text: string, date: string, createdAt: number }[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' }); // Reverted to original, as the provided snippet was syntactically incorrect for this line.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const roleSearchWrapRef = useRef<HTMLDivElement>(null);
  const roleSearchInputRef = useRef<HTMLInputElement>(null);
  const [roleDropdownRect, setRoleDropdownRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [isFollowUpDrawerOpen, setIsFollowUpDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const { user: authUser } = useAuth();
  const { data: sentEmailsRes } = useQuery({
    queryKey: ['emails', 'sent', candidateId],
    queryFn: async () => {
      if (!candidateId) return { items: [] as any[] };
      const candRes = await api.candidates.get(String(candidateId));
      const cand = (candRes.data as any)?.data ?? null;
      const email = String(cand?.email ?? '').trim();
      if (!email) return { items: [] as any[] };
      const { data } = await api.emails.listSent({ candidateEmail: email, limit: 30 });
      return (data.data as any) ?? { items: [] };
    },
    enabled: !!candidateId && mounted && activeTab === 'Emails',
    staleTime: 10_000,
  });

  const sentEmails = (sentEmailsRes as any)?.items ?? [];

  const [gmailProofByLogId, setGmailProofByLogId] = useState<Record<string, string>>({});
  const [gmailProofLoadingId, setGmailProofLoadingId] = useState<string | null>(null);

  const verifyGmailProof = async (emailLogId: string) => {
    setGmailProofLoadingId(emailLogId);
    try {
      const { data } = await api.emails.gmailSentProof(emailLogId);
      const d = data?.data;
      if (!d) throw new Error('No data');
      const line = d.hasSentLabel
        ? 'Confirmed: this message is on your Gmail account (Sent).'
        : `On Gmail. Labels: ${d.labelIds?.join(', ') ?? 'none'}`;
      setGmailProofByLogId((prev) => ({ ...prev, [emailLogId]: line }));
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verify failed';
      setGmailProofByLogId((prev) => ({ ...prev, [emailLogId]: msg }));
    } finally {
      setGmailProofLoadingId(null);
    }
  };

  const stripHtml = (html: string) =>
    String(html ?? '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleResumeFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setToast({ visible: true, message: 'Please upload a valid PDF file' });
      return;
    }
    setIsUploadingResume(true);
    try {
      const res = await api.upload.parseResume(file);
      const data = res.data?.data;
      if (data) {
        updateCandidateMutation.mutate({
          resumeUrl: data.fileUrl,
          resumePublicId: data.publicId,
          resumeText: data.resumeText || data.text || '',
          skills: [...(new Set([...((candidate as any)?.skills || []), ...(data.skills || [])]))]
        });
        setToast({ visible: true, message: 'Resume updated successfully!' });
      }
    } catch (err) {
      setToast({ visible: true, message: 'Failed to parse/upload resume' });
    } finally {
      setIsUploadingResume(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isStatusDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusDropdownOpen]);

  const [editForm, setEditForm] = useState({
    status: '',
    email: '',
    phone: '',
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: any) => api.candidates.update(candidateId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      setIsEditingDocs(false);
    },
  });

  const syncLinkedInMutation = useMutation({
    mutationFn: async () => {
      if (!candidateId) throw new Error('Candidate not found');
      const res = await api.candidates.syncLinkedIn(candidateId);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      setToast({ visible: true, message: 'LinkedIn public data synced' });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to sync LinkedIn data';
      setToast({ visible: true, message });
    },
  });

  const handleEditDetails = (candidateData: any) => {
    setEditForm({
      status: candidateData?.status || 'Sourced',
      email: candidateData?.email || '',
      phone: candidateData?.phone || '',
    });
    setIsStatusDropdownOpen(false);
    setIsEditingDocs(true);
  };

  const handleSaveDetails = () => {
    updateCandidateMutation.mutate(editForm);
  };

  const { data: qData, isLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const res = await api.candidates.get(candidateId);
      return res.data?.data;
    },
    enabled: !!candidateId,
  });

  const { data: jobsResponse } = useQuery({
    queryKey: ['jobs_search', 'roleDropdown', debouncedRoleSearch],
    queryFn: async () => {
      // For role dropdown: recruiter should only see ACCEPTED jobs.
      const term = debouncedRoleSearch.trim();
      const res = await api.jobs.list(
        { search: term || undefined, limit: 50, forRoleDropdown: true } as any
      );
      return res.data?.data?.items || [];
    },
    enabled: isDropdownOpen,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedRoleSearch(roleSearch), 250);
    return () => window.clearTimeout(t);
  }, [roleSearch]);

  const { data: overviewJobs } = useQuery({
    queryKey: ['overview_jobs', authUser?.role],
    queryFn: async () => {
      const res = await api.jobs.list({
        page: 1,
        limit: 12,
        ...(authUser?.role === 'recruiter' ? { forRoleDropdown: true } : {}),
      } as any);
      return res.data?.data?.items || [];
    },
    enabled: activeTab === 'Overview' && !!authUser?.role,
    staleTime: 10 * 1000,
  });

  const filteredOverviewJobs = (() => {
    const items = (overviewJobs as any[]) ?? [];
    const q = debouncedRoleSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((job) => {
      const title = String(job?.title ?? '').toLowerCase();
      const company = String(job?.companyName ?? '').toLowerCase();
      const location = String(job?.location ?? '').toLowerCase();
      return title.includes(q) || company.includes(q) || location.includes(q);
    });
  })();

  useEffect(() => {
    if (!isDropdownOpen) return;
    const el = roleSearchWrapRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setRoleDropdownRect({ left: r.left, top: r.bottom + 8, width: r.width });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isDropdownOpen]);

  // Close the dropdown only when clicking outside input + dropdown.
  useEffect(() => {
    if (!isDropdownOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inInput = roleSearchWrapRef.current?.contains(target) ?? false;
      const inDropdown = roleDropdownRef.current?.contains(target) ?? false;
      if (!inInput && !inDropdown) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isDropdownOpen]);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.projects.list();
      return res.data?.data || [];
    },
    enabled: isProjectDropdownOpen,
  });

  const candidate = qData;

  // EmailDrawer expects jobTitle: string | undefined (not null) and doesn't accept candidate undefined.
  const emailDrawerCandidate: { name?: string; email?: string; jobTitle?: string } = candidate
    ? {
        name: (candidate as any)?.name ?? undefined,
        email: (candidate as any)?.email ?? undefined,
        jobTitle: (candidate as any)?.jobTitle ?? undefined,
      }
    : {};

  const resumePublicId = (candidate as any)?.resumePublicId as string | null | undefined;
  const resumeUrl = (candidate as any)?.resumeUrl as string | null | undefined;
  const resumeFormat =
    typeof resumeUrl === 'string'
      ? (resumeUrl.split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? undefined)
      : undefined;
  const resumeVersion =
    typeof resumeUrl === 'string'
      ? (resumeUrl.match(/\/v(\d+)\//)?.[1] ? Number(resumeUrl.match(/\/v(\d+)\//)![1]) : undefined)
      : undefined;
  const inferredResumeResourceType: 'image' | 'raw' =
    resumeFormat && ['pdf', 'doc', 'docx'].includes(resumeFormat)
      ? 'raw'
      : typeof resumeUrl === 'string' && resumeUrl.includes('/raw/upload/')
        ? 'raw'
        : 'image';

  const { data: signedResumeUrlUpload } = useQuery({
    queryKey: ['upload', 'signed-url', 'upload', resumePublicId, inferredResumeResourceType],
    queryFn: async () => {
      if (!resumePublicId) return null;
      const res = await api.upload.signedUrl(
        resumePublicId,
        inferredResumeResourceType,
        'upload',
        resumeFormat,
        resumeVersion,
        false
      );
      return (res.data as any)?.data?.url as string | undefined;
    },
    enabled: !!resumePublicId,
    staleTime: 60 * 1000,
  });

  const [resolvedResumeUrl, setResolvedResumeUrl] = useState('');

  useEffect(() => {
    const fallback = resumeUrl || '';
    const candidateUrl = signedResumeUrlUpload || fallback;
    if (!candidateUrl) {
      setResolvedResumeUrl('');
      return;
    }

    setResolvedResumeUrl(candidateUrl);
  }, [resumeUrl, signedResumeUrlUpload]);

  useEffect(() => {
    if ((candidate as any)?.internalNotes) {
      setInternalNotes((candidate as any).internalNotes);
    }
  }, [(candidate as any)?.internalNotes]);

  const getPdfUrl = (url?: string | null, forceDownload = false) => {
    if (!url) return '';
    let finalUrl = url;
    if (finalUrl.includes('cloudinary.com')) {
      // If download requested, use Cloudinary's attachment flag
      if (forceDownload && !finalUrl.includes('fl_attachment')) {
        finalUrl = finalUrl
          .replace('/upload/', '/upload/fl_attachment/')
          .replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }
    }
    return finalUrl;
  };

  const getResumePreviewUrl = (url?: string | null) => {
    if (!url) return '';
    const clean = getPdfUrl(url, false);
    const lower = clean.toLowerCase();

    // NOTE:
    // - docs.google.com blocks embedding via X-Frame-Options (sameorigin), so we must NOT use gview in an iframe.
    // - For Office docs, Office Online viewer often works better.
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(clean)}`;
    }
    // For PDFs (incl. Cloudinary), attempt direct embed.
    return clean;
  };

  const handleSelectRole = (job: any) => {
    const jobId = String(job?.id ?? job?._id ?? '');
    if (!jobId) return;

    const selectedTitle = String(job?.title ?? '').trim();

    // Optimistic UI: reflect selection immediately.
    queryClient.setQueryData(['candidate', candidateId], (prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        jobId,
        jobTitle: String(job?.title ?? prev.jobTitle ?? ''),
      };
    });

    updateCandidateMutation.mutate({ jobId });
    // Put selected text into input and keep it there.
    if (selectedTitle) {
      setRoleSearch(selectedTitle);
      setDebouncedRoleSearch(selectedTitle);
    }
    setIsDropdownOpen(false);
    // Keep the search input usable after selecting.
    window.setTimeout(() => roleSearchInputRef.current?.focus(), 0);
  };

  const handleSelectProject = (projectId: string) => {
    updateCandidateMutation.mutate({ projectId });
    setIsProjectDropdownOpen(false);
  };

  const handleOpenChat = () => {
    if (!candidateId) return;
    const jobId = (candidate as any)?.jobId as string | null | undefined;
    const roleTitle = String((candidate as any)?.jobTitle ?? '');
    const companyName = String((candidate as any)?.projectName ?? '');
    const params = new URLSearchParams();
    params.set('focus', 'candidate');
    params.set('candidateId', String(candidateId));
    params.set('candidateName', String((candidate as any)?.name ?? ''));
    if (roleTitle) params.set('roleTitle', roleTitle);
    if (companyName) params.set('companyName', companyName);
    if (jobId) {
      params.set('jobId', jobId);
    }
    router.push(`/dashboard/messages?${params.toString()}`);
    onClose();
  };

  const statusStyle = getStatusColorClasses(candidate?.status);
  const activeStatusMeta = getStatusMeta(editForm.status);

  if (!candidateId || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[40] bg-slate-900/10 backdrop-blur-[2px] animate-in fade-in duration-300 pointer-events-auto"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="fixed top-[57px] bottom-0 right-0 flex flex-col w-full h-[calc(100%-57px)] bg-white shadow-[-10px_0_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-right duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Section */}
        <div className="flex-none bg-white lg:px-8 px-5 pt-6 border-b border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] z-10 shrink-0">
          <div className="flex justify-between items-center w-full mb-5">
            {/* Close */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors bg-gray-50 border border-gray-200/60 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Pagination / Arrows - Top Right - REMOVED */}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full gap-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {isLoading ? (
                <div className="h-[64px] w-[64px] rounded-full bg-gray-200 animate-pulse border-2 border-white shadow-sm shrink-0" />
              ) : candidate?.avatar ? (
                <img src={candidate.avatar} alt="Avatar" className="h-[64px] w-[64px] rounded-full object-cover border-2 border-white shadow-sm shrink-0 bg-white" />
              ) : (
                <div className="h-[64px] w-[64px] rounded-full bg-gradient-to-b from-blue-50 to-blue-100/50 text-blue-600 font-bold text-2xl flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  {candidate?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              <div className="flex flex-col">
                {/* Name */}
                <h1 className="text-[24px] tracking-[-0.015em] font-semibold text-gray-900 leading-tight">
                  {isLoading ? <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mt-1" /> : candidate?.name}
                </h1>

                {/* Title */}
                <div className="text-[14px] text-gray-600 mt-1 font-medium flex items-center gap-2">
                  {isLoading ? <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1" /> : (
                    <>
                      <span>{candidate?.jobTitle || 'Corporate/M&A Partner'}</span>
                      {candidate?.projectName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{candidate.projectName}</span>
                        </>
                      )}
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <div className="relative">
                <button
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-medium rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98] ${isProjectDropdownOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Add to project
                </button>

                {isProjectDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Project</span>
                        <Link
                          href="/dashboard/projects/new"
                          className="text-[11px] text-blue-600 font-black uppercase hover:underline"
                        >
                          + New Project
                        </Link>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {projectsData?.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-[13px] text-gray-400 font-medium">No projects found</p>
                            <Link href="/dashboard/projects/new" className="text-[11px] text-blue-600 font-black uppercase mt-3 inline-block">Create your first</Link>
                          </div>
                        ) : (
                          projectsData?.map((p: any) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectProject(p.id)}
                              className="w-full px-5 py-4 hover:bg-blue-50 text-left border-b border-gray-50 last:border-0 group transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 truncate">{p.name}</span>
                                {candidate?.projectId === p.id && (
                                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsFollowUpDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
              >
                Follow up
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-10 mt-6 overflow-x-auto scbar-none">
            <div className="flex gap-10">
            {TABS.map(tab => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`relative flex items-center gap-2 pb-4 text-[13px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab.icon && (<span className="shrink-0">{tab.icon}</span>)}
                  {tab.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full shadow-[0_-4px_10px_rgba(37,99,235,0.3)] animate-in slide-in-from-bottom-1" />
                  )}
                  {tab.name === 'Emails' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Main Body Section */}
        <div className="flex-1 bg-white overflow-y-auto w-full">
          <div className="mx-auto w-full lg:px-6 px-4 py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 h-full items-start">

            {/* Left Column Sidebar - Roles */}
            <div className="w-full lg:w-[220px] xl:w-[260px] flex flex-col shrink-0 lg:border-r border-gray-100 lg:pr-6 mb-8 lg:mb-0">
              <div className="flex items-center justify-between mb-6 px-1">
                <span className="font-black text-gray-400 text-[11px] uppercase tracking-[0.2em]">Mandates</span>
                <button className="text-gray-300 hover:text-blue-500 transition-colors p-1 hover:bg-blue-50 rounded-md">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Roles List - No Cards, Plane Format */}
              <div className="flex flex-col gap-1">
                <div className="p-3.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-gray-100 active:scale-[0.98]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                      <span className="text-[14px] font-black text-gray-400 group-hover:text-blue-600">
                        {candidate?.projectName ? candidate.projectName.charAt(0) : 'R'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-[13.5px] leading-tight truncate mb-1">
                        {candidate?.jobTitle || 'Corporate/M&A Partner'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[12px] text-gray-500 font-bold tracking-tight">
                          {candidate?.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Main Content */}
            <div className="flex-1 min-w-0 bg-white">
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-10">
                  {/* Plane Roles Selection */}
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 flex items-center gap-2">
                          Add to strategic roles
                          <InfoIcon />
                        </h3>
                        <p className="mt-1 text-[13px] text-gray-500 font-medium">
                          Search and attach this candidate to an accepted role.
                        </p>
                      </div>
                    </div>

                    <div ref={roleSearchWrapRef} className="relative">
                      <svg className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        ref={roleSearchInputRef}
                        type="text"
                        placeholder="Search enterprise roles..."
                        value={roleSearch}
                        onChange={(e) => {
                          setRoleSearch(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm hover:border-gray-300"
                      />

                      {isDropdownOpen && roleDropdownRect &&
                        createPortal(
                          <div
                            ref={roleDropdownRef}
                            className="fixed bg-white/95 border border-gray-200 rounded-2xl shadow-[0_30px_70px_-30px_rgba(15,23,42,0.45)] max-h-[340px] overflow-y-auto z-[9999] animate-in fade-in zoom-in-95 duration-150 origin-top backdrop-blur"
                            style={{ left: roleDropdownRect.left, top: roleDropdownRect.top, width: roleDropdownRect.width }}
                          >
                            <div className="px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                Role results
                              </div>
                              <div className="text-[12px] font-semibold text-gray-500 mt-0.5">
                                {debouncedRoleSearch.trim() ? `Searching: "${debouncedRoleSearch.trim()}"` : 'Type to search roles'}
                              </div>
                            </div>

                            {jobsResponse?.length === 0 ? (
                              <div className="p-5 text-[13px] text-gray-500 text-center">
                                <div className="font-bold text-gray-700">No matches</div>
                                <div className="mt-1 text-gray-400">
                                  Try a different keyword (title, company, or location).
                                </div>
                              </div>
                            ) : (
                              <div className="py-2">
                                {jobsResponse?.map((job: any) => {
                                  const id = job?.id ?? job?._id;
                                  if (!id) return null;
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectRole(job)}
                                      className="w-full text-left px-4 py-3 hover:bg-blue-50/70 focus:bg-blue-50/70 outline-none transition-colors border-b border-gray-50 last:border-0"
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                          <div className="text-[14px] font-black text-gray-900 truncate">
                                            {job.title}
                                          </div>
                                          <div className="mt-1 text-[12px] text-gray-500 font-semibold truncate flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1">
                                              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                              {job.location || '—'}
                                            </span>
                                            {job.type ? (
                                              <span className="inline-flex items-center gap-1 text-gray-400">
                                                <span>•</span>
                                                <span>{job.type}</span>
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="shrink-0 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-1">
                                          Select
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>,
                          document.body
                        )}
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    <FilterBadge text="Client Type" active />
                    <FilterBadge text="Territory" />
                    <FilterBadge text="Mandate" />
                    <FilterBadge text="Budget" />
                  </div>

                  {/* Roles List - No Boxes, Simple Rows */}
                  <div className="space-y-8 mt-2 pb-20">
                    {filteredOverviewJobs?.length ? (
                      filteredOverviewJobs.map((job) => (
                        <RolePlaneItem
                          key={job.id ?? job._id}
                          job={job}
                          candidate={candidate as any}
                          onToast={(message) => setToast({ visible: true, message })}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-[13px] text-gray-500">
                        {debouncedRoleSearch.trim()
                          ? 'No matching roles found for your search.'
                          : 'No roles available yet. Recruiters will see roles after accepting job requests.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity / Calls / LinkedIn / Other Tabs */}
              {(activeTab !== 'Overview') && (
                <div className="flex flex-col min-h-0 bg-white">
                  {activeTab === 'Activity' && candidateId && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <CandidateActivityPanel candidateId={candidateId} isCandidateRole={false} />
                    </div>
                  )}
                  {activeTab === 'Calls' && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <CandidateCallsPanel candidateName={candidate?.name} />
                    </div>
                  )}
                  {activeTab === 'LinkedIn' && (
                    <div className="flex flex-col gap-8">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                        <h3 className="font-black text-gray-900 text-[18px]">LinkedIn Intelligence</h3>
                        <button
                          type="button"
                          onClick={() => {
                            if (!candidate?.linkedInUrl) {
                              setToast({ visible: true, message: 'Please add LinkedIn URL in candidate details first' });
                              return;
                            }
                            syncLinkedInMutation.mutate();
                          }}
                          disabled={syncLinkedInMutation.isPending}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100 disabled:opacity-60"
                        >
                          {syncLinkedInMutation.isPending ? 'Syncing...' : 'Sync Public Data'}
                        </button>
                      </div>
                      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50/40 p-6">
                        <p className="text-[12px] text-gray-600 font-semibold">
                          {candidate?.linkedInUrl ? (
                            <a href={candidate.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {candidate.linkedInUrl}
                            </a>
                          ) : (
                            'No LinkedIn URL added yet'
                          )}
                        </p>
                        {(syncLinkedInMutation.data as any)?.scraped ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-2xl bg-white border border-gray-100 p-4 md:col-span-2">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Profile</p>
                                <div className="flex items-start gap-4">
                                  {(syncLinkedInMutation.data as any).scraped?.avatarUrl ? (
                                    <img
                                      src={(syncLinkedInMutation.data as any).scraped.avatarUrl}
                                      alt="LinkedIn profile"
                                      className="h-14 w-14 rounded-xl object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                      {(syncLinkedInMutation.data as any).scraped?.name?.slice(0, 1) || 'L'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-[15px] font-black text-gray-900 truncate">
                                      {(syncLinkedInMutation.data as any).scraped?.name || 'N/A'}
                                    </p>
                                    <p className="text-[12px] font-semibold text-gray-500 mt-1 truncate">
                                      {(syncLinkedInMutation.data as any).scraped?.pronouns || ''}
                                    </p>
                                    <p className="text-[12px] font-semibold text-blue-700 mt-1 truncate">
                                      {(syncLinkedInMutation.data as any).scraped?.currentCompany || ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Name</p>
                              <p className="text-[14px] font-bold text-gray-900">{(syncLinkedInMutation.data as any).scraped?.name || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Headline</p>
                              <p className="text-[14px] font-bold text-gray-900">{(syncLinkedInMutation.data as any).scraped?.headline || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Location</p>
                              <p className="text-[14px] font-bold text-gray-900">{(syncLinkedInMutation.data as any).scraped?.location || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Skills</p>
                              <p className="text-[14px] font-bold text-gray-900">
                                {Array.isArray((syncLinkedInMutation.data as any).scraped?.skills) && (syncLinkedInMutation.data as any).scraped.skills.length > 0
                                  ? (syncLinkedInMutation.data as any).scraped.skills.join(', ')
                                  : 'N/A'}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Followers</p>
                              <p className="text-[14px] font-bold text-gray-900">{(syncLinkedInMutation.data as any).scraped?.followers || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Connections</p>
                              <p className="text-[14px] font-bold text-gray-900">{(syncLinkedInMutation.data as any).scraped?.connections || 'N/A'}</p>
                            </div>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">About</p>
                              <p className="text-[13px] leading-6 text-gray-700 whitespace-pre-wrap">
                                {(syncLinkedInMutation.data as any).scraped?.about || 'N/A'}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white border border-gray-100 p-4">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Experience</p>
                              {Array.isArray((syncLinkedInMutation.data as any).scraped?.experiences) && (syncLinkedInMutation.data as any).scraped.experiences.length > 0 ? (
                                <div className="space-y-3">
                                  {(syncLinkedInMutation.data as any).scraped.experiences.slice(0, 8).map((exp: any, idx: number) => (
                                    <div key={`${exp.title}-${exp.company}-${idx}`} className="border border-gray-100 rounded-xl p-3">
                                      <p className="text-[13px] font-bold text-gray-900">{exp.title || 'Role'}</p>
                                      <p className="text-[12px] text-gray-600 mt-1">{exp.company || 'Company'}</p>
                                      {(exp.startDate || exp.endDate) && (
                                        <p className="text-[11px] text-gray-400 mt-1">
                                          {[exp.startDate, exp.endDate].filter(Boolean).join(' - ')}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[13px] text-gray-500">N/A</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-white">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)]">
                              <LinkedInIcon />
                            </div>
                            <p className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Ready to sync</p>
                            <p className="text-[14px] text-gray-400 mt-2 max-w-xs px-4">Click "Sync Public Data" to fetch available public LinkedIn details.</p>
                          </div>
                        )}
                        <div className="text-[11px] text-gray-400">
                          Only publicly available LinkedIn data can be fetched.
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'Resume' && (
                    <div
                      className="flex flex-col gap-6 animate-in fade-in duration-300 relative min-h-[400px]"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingResume(true);
                      }}
                      onDragLeave={() => setIsDraggingResume(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingResume(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleResumeFile(file);
                      }}
                    >
                      {isDraggingResume && (
                        <div className="absolute inset-x-0 top-0 bottom-0 z-50 bg-blue-600/5 backdrop-blur-[4px] border-4 border-dashed border-blue-500 rounded-3xl flex flex-col items-center justify-center animate-in zoom-in duration-300 mx-4 my-2">
                          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6 transform rotate-12 group-hover:rotate-0 transition-transform">
                            <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-black text-blue-700 uppercase tracking-tighter mb-2">Release and Update</h3>
                          <p className="text-[14px] text-blue-500 font-bold uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Ready for AI Intelligence</p>
                        </div>
                      )}

                      {isUploadingResume && (
                        <div className="absolute inset-0 z-[60] bg-white/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                          <div className="relative">
                            <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-[15px] font-black text-gray-900 uppercase tracking-[0.2em] mt-8">Synthesizing Profile</p>
                          <p className="text-[12px] text-gray-400 font-medium mt-2">Mapping resume to candidate Intelligence...</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                        <h3 className="font-black text-gray-900 text-[18px]">Resume Contents</h3>
                        <div className="flex items-center gap-3">
                          <input
                            ref={resumeInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleResumeFile(file);
                            }}
                          />
                          <button
                            onClick={() => resumeInputRef.current?.click()}
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[12px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Update Resume
                          </button>
                          {resolvedResumeUrl && (
                            <a
                              href={getPdfUrl(resolvedResumeUrl, true)}
                              download={candidate ? `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[12px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download Original PDF
                            </a>
                          )}
                        </div>
                      </div>

                      {!(candidate as any)?.resumeText && !resolvedResumeUrl ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                          <p className="text-[14px] text-gray-400 font-medium">No resume parsed yet.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col 2xl:flex-row gap-8">
                          {/* Left Panel: Parsed Data */}
                          <div className={`w-full ${(candidate as any)?.resumeUrl ? '2xl:w-[40%]' : ''} flex flex-col gap-8 flex-shrink-0 min-w-0`}>
                            {((candidate as any)?.skills && (candidate as any).skills.length > 0) ? (
                              <div>
                                <h4 className="font-black text-gray-400 text-[11px] uppercase tracking-[0.2em] mb-4">Extracted Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                  {(candidate as any).skills.map((skill: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[13px] font-bold shadow-sm">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {(() => {
                              const skills = (((candidate as any)?.skills ?? []) as string[]).map((s) => s.trim()).filter(Boolean);
                              const resumeText = (((candidate as any)?.resumeText ?? '') as string).trim();
                              if (skills.length === 0 && !resumeText) return null;

                              const normalize = (s: string) =>
                                s
                                  .replace(/[•·●▪️]/g, ' ')
                                  .replace(/\s+/g, ' ')
                                  .trim();

                              // Parse tech stack directly from the resume's own Skills/Tech Stack section.
                              // Supports common formats like:
                              // - Frontend: React, Next.js, Tailwind
                              // - Backend - Node.js / Express
                              // If no categories exist, we'll just show a single "Tech stack" list.
                              const lines = resumeText ? resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
                              const headers = [
                                /^skills?[:]?$/i,
                                /^technical skills?[:]?$/i,
                                /^tech(nical)? stack[:]?$/i,
                                /^tools?[:]?$/i,
                                /^technologies[:]?$/i,
                              ];
                              const startIdx = lines.findIndex((l) =>
                                headers.some((h) => h.test(l.replace(/[:•\-–—]+$/g, '').trim()))
                              );

                              const section: string[] = [];
                              if (startIdx >= 0) {
                                for (let i = startIdx + 1; i < Math.min(lines.length, startIdx + 30); i++) {
                                  const l = lines[i];
                                  if (/^(experience|projects?|education|certifications?|summary|achievements?)[:]?$/i.test(l.replace(/[:•\-–—]+$/g, '').trim())) break;
                                  section.push(l);
                                }
                              }

                              const grouped: Array<{ title: string; items: string[] }> = [];
                              for (const raw of section) {
                                const m = raw.match(/^([A-Za-z][A-Za-z &/+.-]{1,30})\s*[:\-–—]\s*(.+)$/);
                                if (!m) continue;
                                const title = normalize(m[1]).replace(/\s+/g, ' ');
                                const items = m[2]
                                  .split(/[,/|•·●▪️]+/g)
                                  .map((p) => normalize(p))
                                  .filter(Boolean);
                                if (items.length > 0) grouped.push({ title, items });
                              }

                              // De-dupe per group
                              const dedupe = (arr: string[]) => {
                                const seen = new Set<string>();
                                return arr.filter((x) => {
                                  const k = x.toLowerCase();
                                  if (seen.has(k)) return false;
                                  seen.add(k);
                                  return true;
                                });
                              };

                              const hasGroups = grouped.length > 0;
                              const fallbackItems = dedupe(skills).slice(0, 30);

                              if (!hasGroups && fallbackItems.length === 0) return null;

                              return (
                                <div>
                                  <h4 className="font-black text-gray-400 text-[11px] uppercase tracking-[0.2em] mb-4">
                                    Tech stack
                                  </h4>
                                  {hasGroups ? (
                                    <div className="space-y-4">
                                      {grouped.map((g) => (
                                        <div key={g.title}>
                                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                            {g.title}
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {dedupe(g.items).map((s) => (
                                              <span
                                                key={`${g.title}-${s}`}
                                                className="px-3 py-1.5 bg-white text-gray-800 border border-gray-200 rounded-lg text-[13px] font-bold shadow-sm"
                                              >
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {fallbackItems.map((s) => (
                                        <span
                                          key={`stack-${s}`}
                                          className="px-3 py-1.5 bg-white text-gray-800 border border-gray-200 rounded-lg text-[13px] font-bold shadow-sm"
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {(candidate as any)?.resumeText ? (
                              <div className="flex flex-col min-h-0 max-h-[420px] sm:max-h-[520px] 2xl:max-h-[800px]">
                                <h4 className="font-black text-gray-400 text-[11px] uppercase tracking-[0.2em] mb-4">Parsed Text Content</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 lg:p-8 flex-1 overflow-y-auto scbar-thin shadow-sm">
                                  <pre className="text-[13px] text-gray-800 leading-[1.8] font-sans whitespace-pre-wrap break-words">{((candidate as any).resumeText || '')}</pre>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
                                <p className="text-[14px] text-orange-700 font-medium">No extracted text found. Please refer to the document preview below.</p>
                              </div>
                            )}
                          </div>

                          {/* Right Panel: Live PDF Preview */}
                          {resolvedResumeUrl && (
                            <div className="w-full 2xl:w-[60%] flex flex-col min-h-0 h-[460px] sm:h-[520px] lg:h-[560px] 2xl:h-auto 2xl:min-h-[600px] border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Live Document Preview
                                </span>
                              </div>
                              <div className="relative flex-1 bg-gray-50 flex flex-col">
                                {(() => {
                                  const previewUrl = getResumePreviewUrl(resolvedResumeUrl);
                                  const lower = (previewUrl || '').toLowerCase();
                                  const isPdf = lower.endsWith('.pdf');

                                  if (isPdf) {
                                    // <object> tends to be more reliable for PDFs than iframe, and avoids 3rd-party viewers.
                                    return (
                                      <object
                                        key={previewUrl || 'none'}
                                        data={previewUrl}
                                        type="application/pdf"
                                        className="w-full h-full flex-1"
                                        aria-label="Resume PDF Preview"
                                      >
                                        <div className="p-6 text-sm text-gray-600">
                                          <p className="font-semibold text-gray-900">Preview not available in this browser.</p>
                                          <p className="mt-1">Please open the file in a new tab.</p>
                                          <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                                          >
                                            Open resume
                                          </a>
                                        </div>
                                      </object>
                                    );
                                  }

                                  return (
                                    <iframe
                                      key={previewUrl || 'none'}
                                      src={previewUrl}
                                      className="w-full h-full flex-1 border-0"
                                      title="Resume Preview"
                                    />
                                  );
                                })()}
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                  <button
                                    onClick={() => {
                                      const currentTab = activeTab;
                                      setActiveTab('Overview');
                                      setTimeout(() => setActiveTab(currentTab), 10);
                                    }}
                                    className="px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm hover:bg-white transition-colors"
                                  >
                                    Refresh Preview
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'Emails' && (
                    <div className="w-full max-w-3xl mx-auto py-8">
                      <div className="flex items-end justify-between gap-4 mb-6">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email thread</div>
                          <div className="text-[18px] font-black text-gray-900 tracking-tight">Sent emails</div>
                          <div className="text-[13px] text-gray-500 font-medium mt-1 max-w-xl">
                            Sent through your connected Gmail. A <span className="font-bold text-gray-700">Gmail message ID</span> means Google accepted the send. If the recipient still does not see it, check their spam or company quarantine — ATS cannot control that.
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEmailDrawerOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                        >
                          Compose
                        </button>
                      </div>

                      {sentEmails.length === 0 ? (
                        <div className="panel empty-state py-14 text-center">
                          <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z" />
                            </svg>
                          </div>
                          <div className="text-[16px] font-black text-gray-900">No sent emails yet</div>
                          <div className="text-[13px] text-gray-500 font-medium mt-2">
                            Send an email from “Compose” and it will show up here.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sentEmails.map((e: any) => {
                            const createdAt = e?.createdAt ? new Date(e.createdAt) : null;
                            const full = stripHtml(e?.html ?? '');
                            const preview = full.slice(0, 180);
                            return (
                              <div key={e.id} className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="text-[14px] font-black text-gray-900 truncate">{e?.subject ?? '(No subject)'}</div>
                                    <div className="mt-1 text-[12px] text-gray-500 font-bold truncate">
                                      To: <span className="text-gray-700">{Array.isArray(e?.to) ? e.to.join(', ') : ''}</span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-[11px] font-black uppercase tracking-widest text-gray-400">
                                    {createdAt ? createdAt.toLocaleString() : ''}
                                  </div>
                                </div>
                                {preview && (
                                  <div className="mt-3 text-[13px] text-gray-600 font-medium leading-relaxed">
                                    {preview}{full.length > preview.length ? '…' : ''}
                                  </div>
                                )}
                                {Array.isArray(e?.attachments) && e.attachments.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {e.attachments.slice(0, 6).map((a: any, idx: number) => (
                                      <span key={`${e.id}-att-${idx}`} className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-black text-gray-600">
                                        📎 {a?.filename ?? 'attachment'}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {e?.gmailMessageId ? (
                                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                    <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                                      Gmail accepted
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 truncate max-w-full" title={e.gmailMessageId}>
                                      ID {e.gmailMessageId}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={gmailProofLoadingId === e.id}
                                      onClick={() => void verifyGmailProof(String(e.id))}
                                      className="text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    >
                                      {gmailProofLoadingId === e.id ? 'Checking…' : 'Verify on Gmail'}
                                    </button>
                                    {gmailProofByLogId[e.id] && (
                                      <span className="text-[11px] text-gray-600 font-medium">{gmailProofByLogId[e.id]}</span>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-10 text-[12px] text-gray-400 font-medium">
                        Use Dashboard → Email to sync your Gmail inbox. Recipient delivery is not guaranteed by any app — always check spam on the recipient side.
                      </div>
                    </div>
                  )}

                  {['Details', 'Private notes'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center mb-6 text-gray-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">{activeTab} section</h3>
                      <p className="text-[14px] text-gray-400 mt-2 max-w-xs font-medium">Coming soon for this candidate profile.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column Sidebar - Intelligence & Details */}
            <div className="w-full lg:w-[280px] xl:w-[320px] flex flex-col gap-8 shrink-0 lg:border-l border-gray-100 lg:pl-8 mt-12 lg:mt-0">

              {/* Details & Private Notes Top Section */}
              <div className="flex items-center gap-6 border-b border-gray-100 pb-2 mb-2">
                <button
                  onClick={() => setSidebarTab('Details')}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] pb-2 transition-all ${sidebarTab === 'Details' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setSidebarTab('Private notes')}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] pb-2 transition-all ${sidebarTab === 'Private notes' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Private notes
                </button>
              </div>

              {/* Sidebar Tab Content */}
              {sidebarTab === 'Details' ? (
                /* Details View: Professional Details + Intelligence Widgets */
                <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                  {/* Candidate Details Winget */}
                  <div className="space-y-6">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Candidate details</h4>

                    <div className="space-y-8">
                      {/* Status Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
                            <span className={`inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-widest whitespace-nowrap ${statusStyle.text}`}>
                              <StatusOptionIcon kind={getStatusMeta(candidate?.status).icon} />
                              {candidate?.status || 'Sourced'}
                            </span>
                          </div>
                          <button onClick={() => handleEditDetails(candidate)} className="text-gray-300 hover:text-gray-900 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* LinkedIn / Email / Phone - Plane List */}
                      <div className="flex flex-col gap-6">
                        <ContactItem icon={<LinkedInIcon />} label="LinkedIn" value="Visit profile" isLink href={candidate?.linkedInUrl} />
                        <ContactItem icon={<InboxIcon />} label="Email Address" value={candidate?.email || 'yesr01164@gmail.com'} />
                        <ContactItem icon={<PhoneIcon />} label="Mobile Phone" value={candidate?.phone} />
                      </div>

                      <button className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors border-t border-gray-50 flex items-center justify-center gap-2 group">
                        Show more
                        <svg className="h-3 w-3 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Intelligence Source */}
                      <div className="pt-4 border-t border-gray-50">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-3 px-0.5">Sourced By</p>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <span className="text-[11px] font-black text-gray-400">{getInitials(candidate?.recruiterName || 'MG')}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-900 leading-none">{candidate?.recruiterName || 'Md Gafrujama Ansari'}</span>
                            <span className="text-[10px] text-gray-400 mt-1 font-medium italic">Automatic sourcing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Private Notes Section */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {internalNotes.length > 0 && (
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 mb-4">
                      {internalNotes.map(note => {
                        const canEdit = (Date.now() - note.createdAt) < (5 * 60 * 1000); // 5 minutes
                        return (
                          <div key={note.id} className="bg-blue-50/20 border border-blue-100/30 rounded-xl p-3 group/note relative">
                            <p className="text-[12px] text-gray-700 font-medium leading-relaxed pr-10">{note.text}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[8px] text-blue-400 font-black uppercase">{note.date}</span>
                              <div className="flex items-center gap-2 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                {canEdit && (
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setNewNote(note.text);
                                    }}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const updatedNotes = internalNotes.filter(n => n.id !== note.id);
                                    setInternalNotes(updatedNotes);
                                    updateCandidateMutation.mutate({ internalNotes: updatedNotes });
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="group relative">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={editingNoteId ? "Update your note..." : "Add a private note for team..."}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-[13px] font-medium text-gray-600 placeholder:text-gray-300 resize-none outline-none min-h-[80px] focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                    />
                    <div className={`mt-2 flex justify-end gap-2 transition-all ${newNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 invisible'}`}>
                      {editingNoteId && (
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setNewNote('');
                          }}
                          className="px-3 py-1.5 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (!newNote.trim()) return;

                          let updatedNotes;
                          if (editingNoteId) {
                            updatedNotes = internalNotes.map(n => n.id === editingNoteId ? { ...n, text: newNote } : n);
                            setEditingNoteId(null);
                          } else {
                            updatedNotes = [{
                              id: Date.now(),
                              text: newNote,
                              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                              createdAt: Date.now()
                            }, ...internalNotes];
                          }

                          setInternalNotes(updatedNotes);
                          updateCandidateMutation.mutate({ internalNotes: updatedNotes });
                          setNewNote('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-100 active:scale-95"
                      >
                        {editingNoteId ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Slide-over Panels */}
            {isEditingDocs && (
              <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] p-6 sm:p-8 z-[100000] animate-in slide-in-from-right duration-500 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[20px] font-black text-gray-900 uppercase">Update Intelligence</h4>
                  <button onClick={() => setIsEditingDocs(false)} className="text-gray-300 hover:text-gray-900"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Status Segment</label>
                    <div ref={statusDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                        className="w-full text-left text-[14px] font-bold bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 transition-all flex items-center justify-between"
                      >
                        <span className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wide ${activeStatusMeta.pill}`}>
                          <StatusOptionIcon kind={activeStatusMeta.icon} />
                          {editForm.status || 'Select status'}
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
                          {!CANDIDATE_STATUS_OPTIONS.includes(editForm.status as any) && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditForm((prev) => ({ ...prev, status: editForm.status }));
                                setIsStatusDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <StatusOptionIcon kind={getStatusMeta(editForm.status).icon} />
                              {editForm.status}
                            </button>
                          )}
                          {CANDIDATE_STATUS_OPTIONS.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setEditForm((prev) => ({ ...prev, status }));
                                setIsStatusDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 text-left text-[13px] font-semibold transition-colors flex items-center justify-between ${
                                editForm.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                <StatusOptionIcon kind={getStatusMeta(status).icon} />
                                {status}
                              </span>
                              {editForm.status === status && (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Email Identifier</label>
                    <input
                      className="w-full text-[14px] font-bold bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 outline-none focus:border-blue-500 transition-all placeholder:text-gray-200"
                      value={editForm.email}
                      onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Mobile Phone</label>
                    <input
                      className="w-full text-[14px] font-bold bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 outline-none focus:border-blue-500 transition-all placeholder:text-gray-200"
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingDocs(false)}
                      className="sm:flex-1 py-3.5 bg-white text-gray-700 text-[12px] font-black uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      Close
                    </button>
                    <button onClick={handleSaveDetails} className="sm:flex-1 py-3.5 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]">
                      {updateCandidateMutation.isPending ? 'Syncing...' : 'Sync Updates'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <EmailDrawer
        isOpen={isEmailDrawerOpen}
        onClose={() => setIsEmailDrawerOpen(false)}
        // EmailDrawer candidate prop doesn't accept undefined; fallback to empty object.
        candidate={emailDrawerCandidate}
        user={authUser ?? {}}
      />
      <FollowUpDrawer
        isOpen={isFollowUpDrawerOpen}
        onClose={() => setIsFollowUpDrawerOpen(false)}
        candidate={candidate}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>,
    document.body
  );
}
// Subcomponents for exact styling

// Subcomponents for exact styling

function ContactItem({ icon, label, value, isLink = false, href }: { icon: React.ReactNode, label: string, value: string | undefined, isLink?: boolean, href?: string }) {
  const content = (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
        <span className={`text-[13.5px] font-bold block truncate transition-colors ${value ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-300 font-medium italic'}`}>
          {value || 'Not provided'}
        </span>
      </div>
    </div>
  );

  if (isLink && href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  }
  return content;
}

function RolePlaneItem({
  job,
  candidate,
  onToast,
}: {
  job: any;
  candidate: any;
  onToast: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const jobId = job?.id ?? job?._id;
  const candidateId = candidate?.id;

  const normalizeToken = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w.+#/ -]/g, '')
      .trim();

  const stop = new Set([
    'and', 'or', 'the', 'a', 'an', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'is', 'are',
    'this', 'that', 'these', 'those', 'will', 'be', 'you', 'your', 'we', 'our', 'they', 'their',
    'role', 'roles', 'job', 'description', 'responsibilities', 'requirements', 'qualification', 'qualifications',
    'experience', 'years', 'year', 'work', 'working', 'team', 'teams', 'strong', 'good', 'excellent',
    'ability', 'skills', 'skill', 'knowledge', 'familiarity', 'preferred', 'plus',
  ]);

  const extractTopKeywords = (raw: string, limit: number) => {
    const text = normalizeToken(raw);
    if (!text) return [];

    const words = (text.match(/[a-z][a-z0-9+.#/-]{1,30}/g) ?? [])
      .map((w) => w.trim())
      .filter(Boolean)
      .map((w) => (w === 'nodejs' ? 'node.js' : w))
      .map((w) => (w === 'nextjs' ? 'next.js' : w));

    // Try to focus on "requirements" style sections for better signal.
    const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const sectionStart = rawLines.findIndex((l) =>
      /requirements|qualifications|must have|what you will do|responsibilities|we are looking for/i.test(l)
    );
    const sectionLines =
      sectionStart >= 0 ? rawLines.slice(sectionStart, sectionStart + 40).join(' ') : '';
    const sectionWords = sectionLines
      ? (normalizeToken(sectionLines).match(/[a-z][a-z0-9+.#/-]{1,30}/g) ?? []).map((w) => w.trim())
      : [];

    const uni = new Map<string, number>();
    for (const w of words) {
      const t = w.split(' ').join(' ');
      if (t.length < 2 || t.length > 30) continue;
      if (stop.has(t)) continue;
      uni.set(t, (uni.get(t) ?? 0) + 1);
    }

    const bi = new Map<string, number>();
    for (let i = 0; i < words.length - 1; i++) {
      const a = words[i];
      const b = words[i + 1];
      if (stop.has(a) || stop.has(b)) continue;
      if (a.length < 2 || b.length < 2) continue;
      const phrase = `${a} ${b}`.trim();
      if (phrase.length < 4 || phrase.length > 40) continue;
      bi.set(phrase, (bi.get(phrase) ?? 0) + 1);
    }

    // Weight section words higher (requirements/qualifications).
    for (const w of sectionWords) {
      const t = w;
      if (!t || t.length < 2 || t.length > 30) continue;
      if (stop.has(t)) continue;
      uni.set(t, (uni.get(t) ?? 0) + 2);
    }

    // Promote common tech tokens if they appear (not the source of truth, only boosts ranking).
    const techBoost = new Set([
      'react', 'next.js', 'typescript', 'javascript', 'node.js', 'node', 'express', 'nestjs', 'django', 'flask', 'fastapi',
      'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis',
      'graphql', 'rest', 'microservices', 'linux', 'git', 'github', 'ci/cd',
    ]);
    for (const t of techBoost) {
      if (text.includes(t)) uni.set(t, (uni.get(t) ?? 0) + 2);
    }

    const ranked = [...bi.entries(), ...uni.entries()]
      .map(([k, v]) => ({ k, v }))
      .sort((x, y) => y.v - x.v)
      .map((x) => x.k);

    const seen = new Set<string>();
    return ranked
      .map((k) => normalizeToken(k))
      .filter((k) => k && !stop.has(k))
      .filter((k) => {
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, limit);
  };

  const { data: existingApp } = useQuery({
    queryKey: ['applications', 'byJobCandidate', jobId, candidateId],
    queryFn: async () => {
      if (!jobId || !candidateId) return null;
      const res = await api.applications.listPaginated({ jobId, candidateId, limit: 1, page: 1 } as any);
      return (res.data as any)?.data ?? null;
    },
    enabled: !!jobId && !!candidateId,
    staleTime: 10 * 1000,
  });

  const applied = !!(existingApp?.items?.length);

  const resumeSkillsRaw = ((candidate?.skills ?? []) as string[]).map((s) => String(s));
  const resumeSkills = resumeSkillsRaw.map((s) => normalizeToken(s)).filter(Boolean);
  const resumeTextRaw = String(candidate?.resumeText ?? '');
  const resumeText = normalizeToken(resumeTextRaw);
  const jdText = `${job?.title ?? ''}\n${job?.description ?? ''}\n${job?.companyName ?? ''}\n${job?.location ?? ''}`;
  const jdKeywords = extractTopKeywords(jdText, 26);
  const resumeTopKeywords = extractTopKeywords(resumeTextRaw, 26);

  const aliasMap: Record<string, string> = {
    nodejs: 'node.js',
    'node js': 'node.js',
    nextjs: 'next.js',
    'next js': 'next.js',
    reactjs: 'react',
    ts: 'typescript',
    js: 'javascript',
    k8s: 'kubernetes',
    postgres: 'postgresql',
  };
  const canonical = (s: string) => aliasMap[normalizeToken(s)] ?? normalizeToken(s);

  // Precompute canonical sets for faster + more exact matching.
  const resumeSkillCanon = resumeSkills.map((s) => canonical(s)).filter(Boolean);
  const resumeSkillSet = new Set(resumeSkillCanon);
  const resumeKeywordCanon = Array.from(
    new Set(
      [...resumeSkillCanon, ...extractTopKeywords(resumeTextRaw, 40).map((x) => canonical(x))]
        .filter(Boolean)
    )
  );
  const resumeKeywordSet = new Set(resumeKeywordCanon);
  const jdCanon = jdKeywords.map((k) => canonical(k)).filter(Boolean);
  const jdCanonSet = new Set(jdCanon);

  const hasSkill = (needle: string) => {
    const n = canonical(needle);
    if (!n) return false;
    // Multi-word phrases: require token coverage for better precision.
    if (n.includes(' ')) {
      const parts = n.split(' ').filter(Boolean);
      if (parts.length >= 2 && parts.every((p) => resumeKeywordSet.has(p))) return true;
      return resumeText.includes(n);
    }
    // Single keyword: exact set match preferred; fallback to text contains.
    return resumeKeywordSet.has(n) || resumeText.includes(n);
  };

  const overlap = jdKeywords.filter((k) => hasSkill(k));
  const missingAll = jdKeywords.filter((k) => !hasSkill(k));
  const missing = missingAll.slice(0, 14);
  const strengthsAll = resumeTopKeywords
    .map((k) => canonical(k))
    .filter(Boolean)
    .filter((k) => !jdCanonSet.has(k));
  const strengths = strengthsAll.slice(0, 10);

  const buckets: Array<{ label: string; items: string[] }> = [
    {
      label: 'Languages',
      items: ['typescript', 'javascript', 'python', 'java', 'c#', 'go', 'sql'],
    },
    {
      label: 'Frontend',
      items: ['react', 'next.js', 'vue', 'angular', 'tailwind', 'redux'],
    },
    {
      label: 'Backend',
      items: ['node.js', 'express', 'nest', 'graphql', 'rest', 'microservices'],
    },
    {
      label: 'Data/Cloud/DevOps',
      items: ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd'],
    },
    {
      label: 'Databases',
      items: ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'],
    },
  ];

  const missingByBucket = (() => {
    const miss = missingAll.map((k) => canonical(k)).filter(Boolean);
    const used = new Set<string>();
    const out: Array<{ label: string; items: string[] }> = [];
    for (const b of buckets) {
      const hits = b.items.filter((x) => miss.includes(canonical(x)) && !used.has(canonical(x)));
      if (hits.length) {
        hits.forEach((h) => used.add(canonical(h)));
        out.push({ label: b.label, items: hits });
      }
    }
    const other = miss.filter((x) => !used.has(canonical(x))).slice(0, 10);
    if (other.length) out.push({ label: 'Other keywords', items: other });
    return out;
  })();

  const skillHits = jdCanon.filter((k) => resumeSkillSet.has(k)).length;
  const textHits = Math.max(0, overlap.length - skillHits);
  const denom = Math.max(12, jdKeywords.length);
  const jdCoverage = jdKeywords.length ? (skillHits * 1.35 + textHits * 1.0) / denom : 0;
  const resumeCoverageDenom = Math.max(14, resumeTopKeywords.length);
  const resumeOverlap = resumeTopKeywords.filter((k) => hasSkill(k)).length;
  const resumeCoverage = resumeTopKeywords.length ? resumeOverlap / resumeCoverageDenom : 0;
  const score = Math.min(100, Math.round(((jdCoverage * 0.7 + resumeCoverage * 0.3) * 100)));
  const fitLabel = score >= 70 ? 'High fit' : score >= 45 ? 'Good fit' : 'Low fit';
  const chanceLabel = score >= 75 ? 'High selection chances' : score >= 55 ? 'Medium chances' : 'Low chances';
  const canApply = score >= 35;
  const fitClass =
    score >= 70
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : score >= 45
        ? 'bg-blue-50 text-blue-700 border-blue-100'
        : 'bg-gray-50 text-gray-600 border-gray-200';

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!candidateId || !jobId) throw new Error('Missing candidate/job');
      await api.applications.addToPipeline(jobId, candidateId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      await queryClient.invalidateQueries({ queryKey: ['job', String(jobId)] });
      await queryClient.invalidateQueries({ queryKey: ['applications', 'byJobCandidate', jobId, candidateId] });
      onToast?.(`Added ${candidate?.name ?? 'candidate'} to "${job?.title ?? 'role'}"`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to apply mandate';
      onToast?.(msg);
    },
  });

  const salary =
    job?.salaryRange ||
    job?.salary ||
    (job?.minSalary && job?.maxSalary ? `$${job.minSalary} - $${job.maxSalary}` : '') ||
    '—';

  const location = job?.location || '—';
  const company = job?.companyName || 'Company';
  const title = job?.title || 'Role';

  return (
    <div className="flex gap-5 group">
      <div className="pt-2 w-5 shrink-0 text-gray-200 group-hover:text-gray-400 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className="flex flex-col gap-3 flex-1 items-start">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-black text-gray-900 text-[16px] tracking-tight">{company}</span>
          <span className="text-gray-200">/</span>
          <span className="text-[16px] text-gray-500 font-bold tracking-tight">{title}</span>

          <span className={`ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest ${fitClass}`}>
            <svg className="h-[12px] w-[12px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {fitLabel} {score ? `(${score}%)` : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1 rounded-lg text-[12px] font-bold">
            {salary}
          </span>
          <span className="bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1 rounded-lg text-[12px] font-bold">
            {location}
          </span>
          <span className="bg-white text-gray-700 border border-gray-200 px-3 py-1 rounded-lg text-[12px] font-bold">
            {chanceLabel}
          </span>
        </div>

        {/* Deep match insights */}
        <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
            JD match insights (real-time)
          </div>
          <div className="flex flex-wrap gap-2">
            {overlap.slice(0, 8).map((k) => (
              <span
                key={`hit-${k}`}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[12px] font-bold"
                title="Matched from resume"
              >
                {k}
              </span>
            ))}
            {overlap.length === 0 && (
              <span className="text-[12px] text-gray-500 font-medium">No strong keyword matches detected yet.</span>
            )}
          </div>

          {missingAll.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                What to add to improve fit (from JD)
              </div>
              {missingByBucket.length > 0 ? (
                <div className="space-y-2">
                  {missingByBucket.map((b) => (
                    <div key={`bucket-${b.label}`} className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mr-1">
                        {b.label}
                      </span>
                      {b.items.slice(0, 6).map((k) => (
                        <span
                          key={`miss-${b.label}-${k}`}
                          className="px-2.5 py-1 rounded-lg bg-white text-gray-800 border border-gray-200 text-[12px] font-bold"
                          title="Add this to resume/projects if you have it"
                        >
                          + {k}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missing.map((k) => (
                    <span
                      key={`miss-${k}`}
                      className="px-2.5 py-1 rounded-lg bg-white text-gray-800 border border-gray-200 text-[12px] font-bold"
                      title="Add this to resume/projects if you have it"
                    >
                      + {k}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 text-[12px] text-gray-500 font-medium leading-relaxed">
                Professional tip: add 1–2 bullet points in your <span className="font-bold">recent project</span> showing these tools in action (metrics, scale, impact).
              </div>
            </div>
          )}

          {strengths.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                Resume strengths (not emphasized in JD)
              </div>
              <div className="flex flex-wrap gap-2">
                {strengths.slice(0, 8).map((k) => (
                  <span
                    key={`strength-${k}`}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[12px] font-bold"
                    title="Present in resume; JD doesn't mention it clearly"
                  >
                    {k}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[12px] text-gray-500 font-medium leading-relaxed">
                Tip: if the role is relevant, connect these strengths to the JD using 1 quantified project bullet (impact + scope + tools).
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3">
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl text-[12px] font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            Add to intelligence
          </button>
          <button
            onClick={() => addMutation.mutate()}
            disabled={applied || !canApply || addMutation.isPending}
            className="flex items-center gap-2 bg-[#0f172a] px-4 py-2 rounded-xl text-[12px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              applied
                ? 'Already added to pipeline'
                : canApply
                  ? 'Add candidate to this job pipeline'
                  : 'Candidate is not a fit for this role (low match)'
            }
          >
            {applied ? 'Applied' : addMutation.isPending ? 'Applying…' : 'Apply mandate'}
          </button>
        </div>
        {!canApply && (
          <div className="text-[12px] text-gray-400 font-medium">
            Not a fit yet — improve candidate profile/resume to apply.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBadge({ text, active = false }: { text: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-xl text-[12px] font-bold border flex items-center gap-2 transition-all ${active
      ? 'bg-blue-50 text-blue-600 border-blue-100'
      : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'
      }`}>
      {text}
      <svg className="h-3.5 w-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
