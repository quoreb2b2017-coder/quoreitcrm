'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { RouteGuard } from '@/components/RouteGuard';
import { Drawer } from '@/components/ui/Drawer';

import { motion } from 'framer-motion';
import { Briefcase, Users, UserPlus, UserCog, Search, ChevronDown } from 'lucide-react';

type UserRoleOption = 'admin' | 'recruiter';

const ROLE_LABELS: Record<UserRoleOption, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

const COUNTS_QUERY_KEY = ['users', 'roleCounts'] as const;
const USERS_LIST_KEY = ['users', 'list'] as const;

export default function AddCandidatePage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole?.('admin') ?? false;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRoleOption>('recruiter');
  const [error, setError] = useState('');

  const { data: countsData, isLoading: countsLoading } = useQuery({
    queryKey: COUNTS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.users.getRoleCounts();
      return res.data?.data ?? { 
        admin: 0, recruiter: 0, candidateRole: 0, crmCandidate: 0,
        jobs: 0, projects: 0, applied: 0, screening: 0, 
        interview: 0, offered: 0, hired: 0, rejected: 0 
      };
    },
  });

  const { data: usersList, isLoading: listLoading } = useQuery({
    queryKey: USERS_LIST_KEY,
    queryFn: async () => {
      const res = await api.users.listUsers();
      return res.data?.data ?? [];
    },
  });
  
  const counts = countsData ?? { 
    admin: 0, recruiter: 0, candidateRole: 0, crmCandidate: 0,
    jobs: 0, projects: 0, applied: 0, screening: 0, 
    interview: 0, offered: 0, hired: 0, rejected: 0 
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: UserRoleOption }) =>
      api.users.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USERS_LIST_KEY });
      setName('');
      setEmail('');
      setPassword('');
      setRole('recruiter');
      setError('');
      setDrawerOpen(false);
      toast.success('New team member added successfully');
    },
    onError: (err: unknown) => {
      const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { status?: number; data?: { message?: string } } }).response : undefined;
      const status = ax?.status;
      const msg = ax?.data?.message;
      if (status === 404) {
        setError('API not found. Please verify the backend is running.');
      } else {
        const errorMsg = typeof msg === 'string' && msg ? msg : 'An error occurred while adding the user';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ name, email, password, role });
  };

  const roleOptions: UserRoleOption[] = isAdmin ? ['recruiter', 'admin'] : ['recruiter'];

  const statCards = [
    { label: 'Cloud Candidates', value: counts.crmCandidate, icon: <Briefcase className="w-5 h-5" />, color: 'text-emerald-600', detail: 'Total available pipeline' },
    { label: 'Active Openings', value: counts.jobs, icon: <Users className="w-5 h-5" />, color: 'text-blue-600', detail: 'Positions under management' },
    { label: 'Strategy Projects', value: counts.projects, icon: <Search className="w-5 h-5" />, color: 'text-amber-600', detail: 'Custom search initiatives' },
    { label: 'Platform Core', value: counts.admin + counts.recruiter, icon: <UserCog className="w-5 h-5" />, color: 'text-indigo-600', detail: 'Admins & Recruiters' },
  ];

  const pipelineStages = [
    { label: 'Applied', value: counts.applied, color: 'text-blue-500', barColor: 'bg-blue-500' },
    { label: 'Screening', value: counts.screening, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { label: 'Interview', value: counts.interview, color: 'text-purple-500', barColor: 'bg-purple-500' },
    { label: 'Offered', value: counts.offered, color: 'text-indigo-500', barColor: 'bg-indigo-500' },
    { label: 'Hired', value: counts.hired, color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Rejected', value: counts.rejected, color: 'text-gray-400', barColor: 'bg-gray-400' },
  ];

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Actual Platform Stats</h1>
            <p className="text-sm text-gray-500 mt-1">Management console for system-wide performance and team auditing.</p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Provision Account
          </button>
        </div>

        {/* Intelligence Grid - Simple Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div 
              key={card.label} 
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  {countsLoading ? '—' : card.value}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {card.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Monitor - Clean Box */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hiring Pipeline Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Total distribution of candidates across stages.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {pipelineStages.map((stage) => (
                <div key={stage.label} className="space-y-3">
                  <div className="flex items-end justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stage.label}</p>
                    <p className={`text-lg font-bold ${stage.color}`}>{stage.value}</p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stage.value / (counts.crmCandidate || 1)) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${stage.barColor} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Panel */}
          <div className="bg-gray-900 rounded-xl p-8 text-white flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold mb-4">Registry Summary</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Currently managing <span className="text-white font-bold">{counts.admin} admins</span> and <span className="text-white font-bold">{counts.recruiter} recruiters</span>.
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Active Cluster</p>
                <p className="text-sm font-semibold">ATS-MAIN-SVR</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">System Health</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-400">Standard Operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Member Registry - Clean Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-500">Direct list of all Admins and Recruiters</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-gray-400 italic">Retriving team members...</td></tr>
                ) : !usersList || usersList.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-gray-500">No team members found.</td></tr>
                ) : (
                  usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-gray-800 flex items-center justify-center text-white text-xs font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm text-gray-600">{u.email}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Account Provisioning"
          className="sm:max-w-md"
        >
          <div className="p-6">
            <div className="mb-6">
               <h3 className="text-xl font-bold text-gray-900">Provision New User</h3>
               <p className="text-sm text-gray-500 mt-1">Grant secure access to the platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900"
                  placeholder="Alexander Pierce"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900"
                  placeholder="alexander@agency.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRoleOption)}
                    className="w-full h-11 px-4 appearance-none border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full h-11 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Provisioning...' : 'Complete Registration'}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full h-11 bg-white text-gray-500 hover:text-gray-900 text-sm font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Drawer>
      </div>
    </RouteGuard>
  );
}
