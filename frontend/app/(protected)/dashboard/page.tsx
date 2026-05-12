'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { api } from '@/services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';
import {
  Briefcase,
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
  PlusIcon,
  ListChecks,
  TrendingUp,
} from 'lucide-react';
import type { DashboardAnalytics } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

function StatCard({
  label,
  value,
  href,
  icon,
  accentColor,
  bgColor,
  delay = 0,
  compact = false,
}: {
  label: string;
  value: number | undefined;
  href: string | null;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  delay?: number;
  /** Tighter layout for narrow screens */
  compact?: boolean;
}) {
  const iconWrap = compact ? 'h-9 w-9' : 'h-10 w-10';
  const content = (
    <div className="relative h-full min-w-0">
      {/* Top: icon + optional arrow */}
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <div className={`flex shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${iconWrap} ${bgColor} ${accentColor}`}>
          {icon}
        </div>
        {href && (
          <div className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border sm:flex ${bgColor.replace('bg-', 'border-').replace('/10', '/30')} ${accentColor} opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:-translate-x-1`}>
            <ArrowUpRight size={13} />
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className={`font-bold tabular-nums tracking-tight text-[var(--foreground)] ${
          compact ? 'text-xl leading-none sm:text-2xl lg:text-3xl' : 'text-2xl sm:text-3xl'
        }`}
      >
        {value ?? '—'}
      </p>

      {/* Label */}
      <p
        className={`mt-1.5 font-medium uppercase tracking-wider text-[var(--foreground-muted)] ${
          compact ? 'text-[10px] leading-snug sm:text-[12px]' : 'text-[12px]'
        }`}
      >
        {label}
      </p>

      {href && (
        <p
          className={`mt-3 hidden text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block ${accentColor}`}
        >
          View all →
        </p>
      )}
    </div>
  );

  const pad = compact ? 'stat-card group min-w-0 overflow-hidden !p-3.5 sm:!p-5' : 'stat-card group min-w-0 overflow-hidden';
  const baseClass = pad;
  const style = { animationDelay: `${delay}ms` };

  if (href) {
    return (
      <Link
        href={href}
        scroll={false}
        className={`${baseClass} stat-card-link block min-w-0 animate-fade-in-up touch-manipulation`}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`${baseClass} min-w-0 animate-fade-in-up`} style={style}>
      {content}
    </div>
  );
}

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-3 shadow-lg">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">{label}</p>
      <p className="text-[15px] font-bold text-[var(--foreground)]">{payload[0].value} <span className="text-[12px] font-normal text-[var(--foreground-muted)]">candidates</span></p>
    </div>
  );
};

const CustomTooltipArea = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-3 shadow-lg">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">{label}</p>
      <p className="text-[15px] font-bold text-[var(--foreground)]">{payload[0].value} <span className="text-[12px] font-normal text-[var(--foreground-muted)]">hires</span></p>
    </div>
  );
};

function AnalyticsDashboard() {
  const { user, hasRole } = useAuth();
  const isStaff = hasRole?.('admin', 'recruiter') ?? false;
  const isNarrow = useMediaQuery('(max-width: 639px)');

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['analytics', 'dashboard', user?.id ?? 'anon'],
    queryFn: async () => {
      const { data } = await api.analytics.getDashboard();
      if (!data.success || !data.data) throw new Error('Failed to load analytics');
      return data.data as DashboardAnalytics;
    },
    staleTime: 0,
    gcTime: 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    enabled: isStaff,
  });

  if (isLoading) {
    return (
      <div className="min-w-0 space-y-6">
        {/* Skeleton stat cards — single column on small phones */}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="stat-card min-w-0 animate-pulse">
              <div className="skeleton mb-4 h-10 w-10 rounded-[var(--radius-lg)]" />
              <div className="skeleton mb-2 h-8 w-16 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="panel min-w-0 p-4 sm:p-6">
              <div className="skeleton mb-6 h-5 w-32 rounded" />
              <div className="skeleton h-[220px] w-full rounded-[var(--radius-lg)] sm:h-[240px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !res) {
    return (
      <div className="empty-state py-14">
        <TrendingUp size={28} className="text-[var(--foreground-subtle)] mb-3" />
        <p className="text-sm font-semibold text-[var(--foreground-muted)]">Unable to load analytics</p>
        <p className="text-xs text-[var(--foreground-subtle)] mt-1">Check your connection and try again</p>
      </div>
    );
  }

  const applicantsValue = res.totalCandidates ?? res.totalApplicants ?? 0;

  const cards = [
    {
      label: 'Active Jobs',
      value: res.totalJobs,
      href: '/dashboard/jobs',
      icon: <Briefcase size={18} />,
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Projects',
      value: res.totalProjects,
      href: '/dashboard/projects',
      icon: <LayoutDashboard size={18} />,
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Applicants',
      value: applicantsValue,
      href: '/dashboard/applicants',
      icon: <ListChecks size={18} />,
      accentColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Hires',
      value: res.totalHires,
      href: null,
      icon: <UserCheck size={18} />,
      accentColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Interviews',
      value: res.totalInterviews,
      href: null,
      icon: <CalendarDays size={18} />,
      accentColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const pipelineData = (res.pipelineStatus || []).map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    Candidates: item.count,
  }));

  const rawMonthlyPoints = res.hiresPerMonth || [];
  const hasMonthlyData = rawMonthlyPoints.length > 0;
  const hiresByMonth = new Map<string, number>();
  rawMonthlyPoints.forEach((item) => {
    const key = `${item.year}-${item.month}`;
    hiresByMonth.set(key, (hiresByMonth.get(key) ?? 0) + item.count);
  });

  const latestDataPoint = rawMonthlyPoints
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .at(-1);

  const latestMonth = latestDataPoint
    ? new Date(latestDataPoint.year, latestDataPoint.month - 1, 1)
    : null;

  const monthlyData = hasMonthlyData && latestMonth
    ? Array.from({ length: 6 }, (_, idx) => {
        const d = new Date(latestMonth.getFullYear(), latestMonth.getMonth() - (5 - idx), 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        return {
          name: d.toLocaleString('en-US', { month: 'short' }),
          Hires: hiresByMonth.get(key) ?? 0,
        };
      })
    : [];

  const hasPipelineData = pipelineData.length > 0;
  const pipelineTotal = pipelineData.reduce((sum, item) => sum + item.Candidates, 0);

  const chartBottom = isNarrow ? 52 : 8;
  const xAxisAngle = isNarrow ? -32 : 0;
  const chartMarginLeft = isNarrow ? 4 : -12;
  const barChartHeight = isNarrow ? 260 : 240;

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      {/* Stat cards: 1 col narrow, 2 cols from 420px, 5 on lg */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, idx) => (
          <StatCard key={card.label} {...card} delay={idx * 70} compact={isNarrow} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <div className="panel min-w-0 animate-fade-in-up p-4 sm:p-6" style={{ animationDelay: '350ms' }}>
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold tracking-tight text-[var(--foreground)] sm:text-[14px]">
                Pipeline Stages
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)] sm:text-[12px]">Candidates per stage</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="badge badge-blue">Live</span>
              <span className="text-[10px] font-medium text-[var(--foreground-subtle)] sm:text-[11px]">{pipelineTotal} total</span>
            </div>
          </div>
          <div className="min-h-[200px] w-full min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch] sm:min-h-[220px] sm:overflow-visible">
            <div className="w-full min-w-[min(100%,280px)]" style={{ height: barChartHeight }}>
            {hasPipelineData ? (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart
                  data={pipelineData}
                  margin={{ top: 12, right: isNarrow ? 4 : 8, left: chartMarginLeft, bottom: chartBottom }}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={xAxisAngle}
                    textAnchor={isNarrow ? 'end' : 'middle'}
                    height={isNarrow ? 56 : 32}
                    tick={{ fontSize: isNarrow ? 9 : 11, fill: '#94a3b8', fontWeight: 500 }}
                    dy={isNarrow ? 4 : 6}
                  />
                  <YAxis
                    width={isNarrow ? 28 : 36}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: isNarrow ? 9 : 11, fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(37,99,235,0.04)', radius: 4 }} />
                  <Bar dataKey="Candidates" fill="url(#barGrad)" radius={[5, 5, 0, 0]} maxBarSize={isNarrow ? 28 : 36}>
                    <LabelList dataKey="Candidates" position="top" fill="#64748b" fontSize={isNarrow ? 9 : 10} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state h-full">
                <p className="text-sm text-[var(--foreground-muted)]">No pipeline data yet</p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Hiring Velocity */}
        <div className="panel min-w-0 animate-fade-in-up p-4 sm:p-6" style={{ animationDelay: '420ms' }}>
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold tracking-tight text-[var(--foreground)] sm:text-[14px]">Hiring Velocity</h2>
              <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)] sm:text-[12px]">Hires completed per month</p>
            </div>
            <span className="badge badge-green w-fit shrink-0">Monthly</span>
          </div>
          <div className="min-h-[200px] w-full min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch] sm:min-h-[220px] sm:overflow-visible">
            <div className="w-full min-w-[min(100%,260px)]" style={{ height: barChartHeight }}>
            {hasMonthlyData ? (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 12, right: isNarrow ? 4 : 8, left: chartMarginLeft, bottom: isNarrow ? 12 : 8 }}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: isNarrow ? 10 : 11, fill: '#94a3b8', fontWeight: 500 }} dy={6} />
                  <YAxis
                    width={isNarrow ? 28 : 36}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, (d: number) => Math.max(4, d + 1)]}
                    tick={{ fontSize: isNarrow ? 9 : 11, fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltipArea />} cursor={{ stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
                  <Area
                    type="monotone"
                    dataKey="Hires"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGrad)"
                    dot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
                    activeDot={{ r: 5, fill: '#059669', strokeWidth: 0 }}
                  >
                    <LabelList dataKey="Hires" position="top" fill="#64748b" fontSize={isNarrow ? 9 : 10} fontWeight={600} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state h-full">
                <p className="text-sm text-[var(--foreground-muted)]">No hire data yet</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isStaff = hasRole?.('admin', 'recruiter') ?? false;
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--foreground-muted)]">{greeting},</p>
          <div className="mt-1 flex flex-col items-start gap-2 sm:mt-0.5 sm:flex-row sm:flex-wrap sm:items-baseline">
            <h1 className="max-w-full truncate text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {user?.name}
            </h1>
            <span className="inline-flex shrink-0 items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              {roleLabel}
            </span>
          </div>
        </div>

        {user?.role === 'admin' && (
          <Link
            href="/dashboard/jobs?new=true"
            scroll={false}
            className="btn-primary w-full shrink-0 justify-center touch-manipulation sm:w-auto"
          >
            <PlusIcon size={15} />
            Post a Role
          </Link>
        )}
      </div>

      {/* Staff analytics */}
      {isStaff && <AnalyticsDashboard />}

      {/* Candidate view */}
      {!isStaff && (
        <div className="space-y-5">
          <Link
            href="/dashboard/applications"
            scroll={false}
            className="stat-card stat-card-link group block w-full max-w-full animate-fade-in-up touch-manipulation sm:max-w-xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-blue-50 text-blue-600 mb-4">
              <ListChecks size={18} />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">—</p>
            <p className="mt-1.5 text-[12px] font-medium uppercase tracking-wider text-[var(--foreground-muted)]">My Applications</p>
          </Link>

          <div>
            <h2 className="section-header mb-4">Quick actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard/applications"
                className="panel card-hover group flex gap-4 p-5 transition-all animate-fade-in-up"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <ListChecks size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-[var(--foreground)]">My Applications</h3>
                  <p className="mt-0.5 text-[13px] text-[var(--foreground-muted)]">Track your job applications</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
