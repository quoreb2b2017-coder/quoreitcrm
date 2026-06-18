/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/RouteGuard';
import { Search, Plus, MoreHorizontal, Clock, Star, ExternalLink, ChevronDown, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CLIENTS_KEY = ['clients'];

function TimeAgoLabel({ date }: { date: string | number | Date }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!date) return <span>just now</span>;

  const diffMs = Math.max(0, now - new Date(date).getTime());

  if (diffMs < 60000) return <span>{Math.max(1, Math.floor(diffMs / 1000))}s ago</span>;
  if (diffMs < 3600000) return <span>{Math.floor(diffMs / 60000)}m ago</span>;
  if (diffMs < 86400000) return <span>{Math.floor(diffMs / 3600000)}h ago</span>;
  return <span>{Math.floor(diffMs / 86400000)}d ago</span>;
}

export default function ClientsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [hoveredIdeal, setHoveredIdeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter States
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [roleStatusFilter, setRoleStatusFilter] = useState('');
  const [recruiterFilter, setRecruiterFilter] = useState('');
  const [smartFilter, setSmartFilter] = useState('');

  const queryClient = useQueryClient();

  const { data: clientsRes, isLoading } = useQuery({
    queryKey: CLIENTS_KEY,
    queryFn: async () => {
      const { data: res } = await api.clients.list();
      return res;
    },
    refetchInterval: 3000,
  });

  const clients = clientsRes?.data || [];

  const [hideAgencyRoles, setHideAgencyRoles] = useState(false);

  const tabCounts = {
    active: clients.filter((c: any) => c.status === 'Active').length,
    pending: clients.filter((c: any) => c.status === 'Pending Request').length,
    rejected: clients.filter((c: any) => c.status === 'Rejected').length,
    invites: clients.filter((c: any) => c.status === 'Invites').length,
    inactive: 0,
    all: clients.length
  };

  const uniqueLocations = Array.from(new Set(clients.map((c: any) => c.location).filter(Boolean))) as string[];
  const uniqueSalaries = Array.from(new Set(clients.map((c: any) => c.salary).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(clients.map((c: any) => c.jobStatus).filter(Boolean))) as string[];

  let visibleClients = clients.filter((c: any) => {
    if (hideAgencyRoles && c.title?.toLowerCase().includes('agency')) return false;

    if (locationFilter && c.location !== locationFilter) return false;
    if (salaryFilter && c.salary !== salaryFilter) return false;
    if (roleStatusFilter && c.jobStatus !== roleStatusFilter) return false;
    if (recruiterFilter === 'assigned_to_me' && (!c.recruiterIds || c.recruiterIds.length === 0)) return false; // mock logic

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = c.companyName?.toLowerCase().includes(searchLower) || c.title?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'Active';
    if (activeTab === 'pending') return c.status === 'Pending Request';
    if (activeTab === 'rejected') return c.status === 'Rejected';
    if (activeTab === 'invites') return c.status === 'Invites';
    return false;
  });

  if (smartFilter === 'highest_salary') {
    visibleClients = visibleClients.sort((a: any, b: any) => {
      const sA = parseInt(a.salary.replace(/[^0-9]/g, '')) || 0;
      const sB = parseInt(b.salary.replace(/[^0-9]/g, '')) || 0;
      return sB - sA;
    });
  } else if (smartFilter === 'most_activity') {
    visibleClients = visibleClients.sort((a: any, b: any) => b.totalInterviewing - a.totalInterviewing);
  }

  const handleExport = () => {
    if (visibleClients.length === 0) {
      toast.error('No clients to export');
      return;
    }
    const headers = ['Company', 'Role', 'Reward', 'Salary', 'Status', 'Total Interviewing', 'Submitted', 'Interviewing'];
    const csvContent = [
      headers.join(','),
      ...visibleClients.map((c: any) => [
        `"${c.companyName}"`,
        `"${c.title}"`,
        `"${c.reward}"`,
        `"${c.salary}"`,
        `"${c.status}"`,
        c.totalInterviewing,
        c.submitted,
        c.interviewing
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clients_export.csv';
    link.click();
    toast.success('Clients exported successfully!');
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedClients);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedClients(newSet);
  };

  const toggleAll = () => {
    if (selectedClients.size === visibleClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(visibleClients.map((c: any) => c.id)));
    }
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="mx-auto min-w-0 max-w-7xl space-y-6 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Your clients</h1>
          <button onClick={() => router.push('/dashboard/jobs')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Find clients
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'active', label: 'Active', count: tabCounts.active },
            { id: 'pending', label: 'Pending', count: tabCounts.pending },
            { id: 'rejected', label: 'Rejected', count: tabCounts.rejected },
            { id: 'invites', label: 'Invites', count: tabCounts.invites },
            { id: 'inactive', label: 'Inactive', count: null },
            { id: 'all', label: 'All', count: tabCounts.all },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-700'
                }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto hidden xl:block">
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium dark:text-blue-400">
              Have clients outside of Paraform?
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-full mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] font-medium border border-gray-200 rounded px-1.5 py-0.5 text-gray-400 dark:border-gray-700">Ctrl K</span>
          </div>
        </div>

        {/* Unified horizontal scroll: wide table + filters (min-w-0 so flex parents don’t clip) */}
        <div className="min-w-0 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 sm:mx-0 sm:px-0">
          <div className="w-max min-w-full space-y-4">

            {/* Filters */}
            <div className="flex items-center gap-2 text-sm">
              {[
                { name: 'Smart Filters', state: smartFilter, set: setSmartFilter, options: ['highest_salary', 'most_activity'] },
                { name: 'Location', state: locationFilter, set: setLocationFilter, options: uniqueLocations },
                { name: 'Salary', state: salaryFilter, set: setSalaryFilter, options: uniqueSalaries },
                { name: 'Role status', state: roleStatusFilter, set: setRoleStatusFilter, options: uniqueStatuses },
                { name: 'Recruiter', state: recruiterFilter, set: setRecruiterFilter, options: ['assigned_to_me'] },
              ].map(filter => (
                <div key={filter.name} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === filter.name ? null : filter.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium border transition-colors whitespace-nowrap ${filter.state || openDropdown === filter.name
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                  >
                    {filter.state ? filter.state.replace('_', ' ') : filter.name} <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>
                  {openDropdown === filter.name && (
                    <div className="absolute top-full left-0 mt-2 min-w-[160px] bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden z-20 dark:bg-gray-800 dark:border-gray-700">
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => { filter.set(''); setOpenDropdown(null); }}
                        >
                          Clear
                        </button>
                        {filter.options.map((opt: string) => (
                          <button
                            key={opt}
                            onClick={() => { filter.set(opt); setOpenDropdown(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-700 hover:text-blue-600"
                          >
                            {opt.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => setHideAgencyRoles(!hideAgencyRoles)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${hideAgencyRoles
                  ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:border-purple-600 dark:text-white'
                  : 'text-purple-700 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300'
                  }`}
              >
                Hide agency roles
              </button>

              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'more_filters' ? null : 'more_filters')}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap transition-colors dark:hover:text-gray-300"
                >
                  21 more filters +
                </button>
                {openDropdown === 'more_filters' && (
                  <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-white border border-gray-100 shadow-xl rounded-lg z-20 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advanced filters mock UI. In a real app, this would be a full grid of extra filter options.</p>
                    <button onClick={() => setOpenDropdown(null)} className="mt-3 w-full bg-blue-600 text-white rounded-md py-1.5 text-sm font-medium">Apply</button>
                  </div>
                )}
              </div>

              <div className="ml-auto flex items-center gap-3 min-w-fit pl-2 relative">
                {selectedClients.size > 0 && (
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{selectedClients.size} roles selected</span>
                )}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ExternalLink className="w-4 h-4" /> Export
                </button>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'more_actions' ? null : 'more_actions')}
                    className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openDropdown === 'more_actions' && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden z-20 dark:bg-gray-800 dark:border-gray-700">
                      <button onClick={() => { toast("Archive triggered"); setOpenDropdown(null) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Archive Selected</button>
                      <button onClick={() => { toast("Email triggered"); setOpenDropdown(null) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Email Selected</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table: inner scroll so wide columns aren’t clipped by rounded card */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-max min-w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-[12px] font-semibold text-gray-500 border-b border-gray-200 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedClients.size > 0 && selectedClients.size === visibleClients.length}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Company <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Role <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Reward <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Salary <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Status <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Total interviewing <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Submitted <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Interviewing <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Rating <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Last active <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold group cursor-pointer hover:text-gray-700">Hiring <span className="inline-flex text-[10px] tracking-tighter opacity-50 ml-1">↑↓</span></th>
                    <th className="px-4 py-3 font-semibold">Requirements</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading ? (
                    <tr><td colSpan={14} className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading clients...</td></tr>
                  ) : visibleClients.length === 0 ? (
                    <tr><td colSpan={14} className="py-12 text-center text-sm text-gray-500">No active client roles found.</td></tr>
                  ) : visibleClients.map((item: any) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50 group ${selectedClients.has(item.id) ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedClients.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.companyLogo ? (
                            <img
                              src={item.companyLogo}
                              alt=""
                              className="w-7 h-7 rounded object-cover border border-gray-200 bg-white"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded border border-gray-200 bg-gray-100 hidden" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{item.companyName || 'Unknown Company'}</span>
                          <Star className={`w-3.5 h-3.5 ml-auto cursor-pointer ${item.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-400 dark:text-gray-600'}`} />
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 relative">
                        <div
                          className="flex items-center gap-2 group/role cursor-help"
                          onMouseEnter={() => item.idealCandidate && setHoveredIdeal(item.id)}
                          onMouseLeave={() => setHoveredIdeal(null)}
                        >
                          <span className="font-medium text-gray-700 group-hover/role:text-blue-600 transition-colors">
                            {item.title}
                          </span>

                          {/* Ideal Candidate Popover */}
                          {hoveredIdeal === item.id && item.idealCandidate && (
                            <div className="absolute left-0 top-full mt-2 w-[500px] z-50">
                              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-5">
                                <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Ideal candidates</h3>
                                <p className="text-[12px] text-gray-400 mb-4">Upload a candidate's resume <span className="font-semibold text-gray-600 underline cursor-pointer">here</span> to see how well they fit the requirements.</p>

                                <div className="space-y-4">
                                  {item.idealCandidate.seniority && (
                                    <div>
                                      <div className="text-[12px] font-medium text-gray-600 mb-1">Seniority</div>
                                      <div className="text-[13px] text-gray-400 flex items-start gap-2">
                                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        {item.idealCandidate.seniority}
                                      </div>
                                    </div>
                                  )}
                                  {item.idealCandidate.experience && (
                                    <div>
                                      <div className="text-[12px] font-medium text-gray-600 mb-1">Work experience</div>
                                      <div className="text-[13px] text-gray-400 flex items-start gap-2">
                                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        {item.idealCandidate.experience}
                                      </div>
                                    </div>
                                  )}
                                  {item.idealCandidate.education && (
                                    <div>
                                      <div className="text-[12px] font-medium text-gray-600 mb-1">Education</div>
                                      <div className="text-[13px] text-gray-400 flex items-start gap-2">
                                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        {item.idealCandidate.education}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Reward */}
                      {/* Reward */}
                      <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 tabular-nums">
                        <span className="underline decoration-gray-300 underline-offset-4 decoration-[0.5px] cursor-pointer hover:text-gray-900 transition-colors">
                          {item.reward}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{item.salary}</td>

                      <td className="px-4 py-3">
                        {item.status === 'Pending Request' || item.status === 'Invites' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 mr-1">Request:</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                api.jobs.acceptJob(item.id).then(() => {
                                  toast.success('Job request accepted!');
                                  queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
                                }).catch(err => {
                                  console.error('Error accepting job:', err);
                                  toast.error('Failed to accept job request');
                                });
                              }}
                              className="p-1.5 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700 bg-white border border-green-200 shadow-sm transition-all duration-200 active:scale-95"
                              title="Accept"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                api.jobs.rejectJob(item.id).then(() => {
                                  toast.success('Job request rejected');
                                  queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
                                }).catch(err => {
                                  console.error('Error rejecting job:', err);
                                  toast.error('Failed to reject job request');
                                });
                              }}
                              className="p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 bg-white border border-red-200 shadow-sm transition-all duration-200 active:scale-95"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : item.status === 'Rejected' ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500 whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>Rejected <TimeAgoLabel date={item.lastActive || Date.now()} /></span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green-600 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span>Approved <TimeAgoLabel date={item.lastActive || Date.now()} /></span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500 tabular-nums">{item.totalInterviewing}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{item.submitted}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{item.interviewing}</td>

                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium">{item.rating === 'New' ? 'New' : item.rating || '-'}</span>
                          <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.5l-3 3-1.5-1.5 4.5-4.5 4.5 4.5-1.5 1.5-3-3z" /></svg>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-500 tabular-nums text-[12px] whitespace-nowrap">
                        {item.companyName === 'Rimon' && item.title.includes('Trusts') ? '3d ago' : '-'}
                      </td>

                      <td className="px-4 py-3 text-gray-500 tabular-nums text-[12px]">{item.hiringCount === 1 ? '-' : item.hiringCount || '-'}</td>

                      {/* Requirements */}
                      <td className="px-4 py-3 text-center">
                        <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
                          View ({item.requirements?.length || 0})
                        </button>
                      </td>

                      <td className="px-2 py-3 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/50">
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                  Load more clients
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
