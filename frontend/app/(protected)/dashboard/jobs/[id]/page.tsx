/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/RouteGuard';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Building2,
  DollarSign,
  Globe,
  Users,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Plus,
  Check,
  Clock,
  Gift,
  HelpCircle,
  Briefcase,
  Star
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = hasRole?.('admin') ?? false;
  const isRecruiter = hasRole?.('recruiter') ?? false;

  const { data, isLoading, error } = useQuery({
    queryKey: ['job', params.id],
    queryFn: async () => {
      const { data: res } = await api.jobs.get(params.id);
      return res.data;
    },
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.jobs.acceptJob(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', params.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs_search', 'roleDropdown'] });
      toast.success('Strategy accepted successfully');
    }
  });

  const requestMutation = useMutation({
    mutationFn: () => api.jobs.requestAccess(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', params.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Access requested pending admin approval');
    }
  });

  const approveMutation = useMutation({
    mutationFn: (recruiterId: string) => api.jobs.approveAccess(params.id, recruiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', params.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs_search', 'roleDropdown'] });
      toast.success('Access approved for recruiter');
    }
  });

  const job = data;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-gray-500 font-medium">Job not found or access denied.</p>
        <Link href="/dashboard/jobs" className="text-blue-600 font-bold text-sm hover:underline">Return to browse</Link>
      </div>
    );
  }

  const myAssignment = job.recruiterAssignments?.find((a: any) => String(a.recruiterId) === String(user?.id));
  const isPending = isRecruiter && myAssignment?.status === 'pending';
  const isRequested = isRecruiter && (myAssignment?.status as string) === 'requested';
  const isAccepted = isRecruiter && myAssignment?.status === 'accepted';
  const isRejected = isRecruiter && myAssignment?.status === 'rejected';

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="max-w-[900px] mx-auto py-12 px-6">

        {/* Navigation */}
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-10 text-sm font-bold tracking-tight">
          <ArrowLeft className="w-4 h-4" />
          BACK TO ROLES
        </Link>

        {/* Header - Premium Branding */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
          <div className="flex gap-8">
            <div className="w-24 h-24 rounded-[2rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 flex items-center justify-center p-5 animate-in fade-in zoom-in-95 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {job.companyLogo ? (
                <img src={job.companyLogo} className="w-full h-full object-contain relative z-10" />
              ) : (
                <Building2 className="w-12 h-12 text-gray-200 relative z-10" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter lowercase">{job.companyName} • {job.title}</h1>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
                  QUALIFIED
                </span>
                {isPending && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                    <Clock className="w-3 h-3" /> NEW REQUEST
                  </span>
                )}
                {isRequested && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                    <Clock className="w-3 h-3" /> WAITING FOR ADMIN
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg whitespace-nowrap"><MapPin className="w-3.5 h-3.5 text-gray-300" /> {job.location}</span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg whitespace-nowrap"><Globe className="w-3.5 h-3.5 text-gray-300" /> {job.workplaceType}</span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg whitespace-nowrap font-black border border-emerald-100/50"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salary}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {isPending ? (
              <button
                onClick={() => acceptMutation.mutate()}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3"
              >
                Accept Strategy <Check className="w-4 h-4" />
              </button>
            ) : isRequested ? (
              <button
                disabled
                className="px-8 py-4 bg-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center gap-3"
              >
                Request Pending <Clock className="w-4 h-4" />
              </button>
            ) : isRejected ? (
              <button
                disabled
                className="px-8 py-4 bg-rose-100 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center gap-3"
              >
                Access Denied
              </button>
            ) : isAccepted || isAdmin ? (
              <button className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => requestMutation.mutate()}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3"
              >
                Request Access <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Professional JD Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Description Column */}
          <div className="lg:col-span-2 space-y-12">

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Briefcase className="w-4 h-4" /> THE MISSION
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-[18px] leading-[1.85] font-medium whitespace-pre-wrap selection:bg-blue-100">{job.description}</p>
              </div>
            </section>

            {job.benefits && job.benefits.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <Gift className="w-4 h-4" /> PERKS & BENEFITS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 tracking-tight lowercase">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {job.personalQuestions && job.personalQuestions.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <HelpCircle className="w-4 h-4" /> SCREENING MANDATES
                </h3>
                <div className="space-y-3">
                  {job.personalQuestions.map((q, i) => (
                    <div key={i} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group">
                      <span className="text-sm font-bold text-gray-900">{q.question}</span>
                      {q.required && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg">Required</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-10">
            {job.reward && (
              <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Star className="w-24 h-24" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Referral reward</p>
                <p className="text-3xl font-black tracking-tight mb-4">{job.reward}</p>
                <p className="text-xs font-bold leading-relaxed opacity-90">Refer a qualified candidate and receive this bonus upon successful placement.</p>
              </div>
            )}

            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center group/item">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Applicants</span>
                <span className="text-xl font-black text-gray-900 tabular-nums">{job.stats?.totalCandidates || 0}</span>
              </div>

              <div className="flex justify-between items-center group/item">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Recruiters</span>
                <span className="text-xl font-black text-gray-900 tabular-nums">{(job.stats as any)?.activeRecruiters || 0}</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Mandate Openings</span>
                <span className="text-xl font-black text-blue-600 tabular-nums">{job.stats?.openings || 1}</span>
              </div>

              {job.reward && (
                <div className="flex justify-between items-center group/item">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Mandate Reward</span>
                  <span className="text-lg font-black text-emerald-600 tabular-nums">{job.reward}</span>
                </div>
              )}

              <div className="flex justify-between items-center group/item pt-2">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</span>
                <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active mandate</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Posted</span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">Today</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Role ID</span>
                <span className="text-[10px] font-bold text-gray-400 tabular-nums bg-gray-50 px-2 py-1 rounded-md border border-gray-100/50">#{params.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            {isAdmin && job.recruiterAssignments?.some((a: any) => a.status === 'requested') && (
              <div className="space-y-3 pt-6 mt-6 border-t border-dashed border-gray-100">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-1">Pending Approvals</p>
                {job.recruiterAssignments.filter((a: any) => a.status === 'requested').map((a: any) => (
                  <div key={a.recruiterId} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{a.recruiterName || 'Assignee'}</p>
                      <p className="text-[9px] text-gray-500 font-medium truncate">{a.recruiterEmail}</p>
                    </div>
                    <button
                      onClick={() => approveMutation.mutate(a.recruiterId)}
                      disabled={approveMutation.isPending}
                      className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

const Edit2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
