'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Send,
  Search,
  Building2,
  MessageSquare,
  Info,
  ArrowLeft,
  MoreHorizontal,
  Lock,
  CheckCheck,
  Trash2,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteGuard } from '@/components/RouteGuard';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/tokenStore';

type ChatJob = {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  lastMessageAt?: string | null;
  totalMessages?: number;
  recruiters: { id: string; name: string; email: string }[];
};

type ChatMessage = {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  /** Echoed back by server when sender originally provided one — used for optimistic dedupe. */
  clientId?: string;
};

type OnlineUser = {
  id: string;
  name: string;
  email?: string;
};

type SocketAck<T = unknown> = { ok: boolean; error?: string; data?: T };

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '')
    : 'http://localhost:4000');

const formatSidebarTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return format(date, 'h:mm a');
  return format(date, 'MMM d');
};

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const [jobActivityMap, setJobActivityMap] = useState<Record<string, number>>({});
  const [unreadByJob, setUnreadByJob] = useState<Record<string, number>>({});
  const [knownLastMessageAtByJob, setKnownLastMessageAtByJob] = useState<Record<string, string>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedJobIdRef = useRef<string | null>(null);

  const { data: jobsRes, isLoading: loadingJobs } = useQuery({
    queryKey: ['messages', 'jobs'],
    queryFn: async () => {
      const { data } = await api.messages.listJobs();
      return data.data ?? [];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  });

  const jobs = (jobsRes || []) as ChatJob[];
  const preselectedJobId = searchParams.get('jobId');
  const focusCandidate = searchParams.get('focus') === 'candidate';
  const focusCandidateName = searchParams.get('candidateName') || '';
  const focusRoleTitle = searchParams.get('roleTitle') || '';
  const focusCompanyName = searchParams.get('companyName') || '';
  const normalized = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  useEffect(() => {
    if (!preselectedJobId) return;
    setSelectedJobId(preselectedJobId);
    if (isMobileView) setShowSidebarOnMobile(false);
  }, [preselectedJobId, isMobileView]);

  useEffect(() => {
    if (!focusCandidate || selectedJobId || jobs.length === 0) return;

    const role = normalized(focusRoleTitle);
    const company = normalized(focusCompanyName);
    const hasPreselected = !!preselectedJobId;
    const preselectedExists = hasPreselected && jobs.some((j) => j.id === preselectedJobId);

    // If valid preselected id exists, keep it (already set by the effect above).
    if (preselectedExists) return;

    const byRoleAndCompanyExact = jobs.find((j) =>
      role &&
      company &&
      normalized(j.title) === role &&
      normalized(j.companyName) === company
    );
    const byRoleExact = jobs.find((j) => role && normalized(j.title) === role);
    const byRoleLoose = jobs.find((j) =>
      role && (normalized(j.title).includes(role) || role.includes(normalized(j.title)))
    );

    const fallback = byRoleAndCompanyExact ?? byRoleExact ?? byRoleLoose ?? null;
    if (fallback) {
      setSelectedJobId(fallback.id);
      if (isMobileView) setShowSidebarOnMobile(false);
    }
  }, [focusCandidate, selectedJobId, jobs, focusRoleTitle, focusCompanyName, isMobileView, preselectedJobId]);

  useEffect(() => {
    if (jobs.length === 0) return;
    setJobActivityMap((prev) => {
      const next = { ...prev };
      const now = Date.now();
      // Preserve backend order as baseline, but let fresh activity override it.
      jobs.forEach((job, idx) => {
        if (!next[job.id]) next[job.id] = now - idx;
      });
      return next;
    });
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return jobs
      .filter(job =>
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q)
      )
      .sort((a, b) => (jobActivityMap[b.id] ?? 0) - (jobActivityMap[a.id] ?? 0));
  }, [jobs, searchQuery, jobActivityMap]);

  useEffect(() => {
    if (jobs.length === 0) return;

    setKnownLastMessageAtByJob((prev) => {
      const next = { ...prev };
      const now = Date.now();
      const selected = selectedJobIdRef.current;

      jobs.forEach((job) => {
        const current = String(job.lastMessageAt ?? '');
        const previous = String(prev[job.id] ?? '');

        // First-time seed
        if (!previous) {
          if (current) next[job.id] = current;
          return;
        }

        // New message detected from polling (fallback when socket misses)
        if (current && current !== previous) {
          next[job.id] = current;
          setJobActivityMap((old) => ({ ...old, [job.id]: now }));
          if (selected !== job.id) {
            setUnreadByJob((old) => ({ ...old, [job.id]: (old[job.id] ?? 0) + 1 }));
          } else {
            queryClient.invalidateQueries({ queryKey: ['messages', 'history', job.id] });
          }
        }
      });

      return next;
    });
  }, [jobs, queryClient]);

  useEffect(() => {
    selectedJobIdRef.current = selectedJobId;
  }, [selectedJobId]);

  const { data: historyRes, isLoading: loadingHistory } = useQuery({
    queryKey: ['messages', 'history', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return [] as ChatMessage[];
      const { data } = await api.messages.history(selectedJobId);
      return (data.data as ChatMessage[]) ?? [];
    },
    enabled: !!selectedJobId,
  });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Messages when history loads
  useEffect(() => {
    if (historyRes && selectedJobId) {
      setMessages(historyRes);
    }
  }, [historyRes, selectedJobId]);

  // Stable ref to the currently joined jobs so we can re-join on reconnect
  // without re-creating the socket each time the jobs list changes.
  const joinedJobsRef = useRef<Set<string>>(new Set());
  const visibleJobIds = useMemo(() => jobs.map((j) => j.id), [jobs]);
  const visibleJobIdsRef = useRef<string[]>([]);
  useEffect(() => {
    visibleJobIdsRef.current = visibleJobIds;
  }, [visibleJobIds]);

  /** Ask the server to join one room, with a timeout-protected ack. */
  const joinRoom = useCallback((s: Socket, jobId: string) => {
    s.timeout(5000).emit('join_room', { jobId }, (err: Error | null, ack?: SocketAck) => {
      if (err) {
        // Ack timeout — server may be backed up; we'll retry on the next reconnect.
        return;
      }
      if (ack?.ok) {
        joinedJobsRef.current.add(jobId);
      } else if (ack?.error) {
        // Silently ignore "no access" rooms (recruiter not yet accepted, etc.).
      }
    });
  }, []);

  // Socket setup — create once on mount, keep it alive across navigation.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialToken = getAccessToken();
    if (!initialToken) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // `auth` accepts a function — socket.io-client calls it on every (re)connect
      // so a freshly refreshed JWT is always picked up.
      auth: (cb) => cb({ token: getAccessToken() ?? '' }),
    });

    socketRef.current = s;

    s.on('connect', () => {
      setSocketConnected(true);
      // (Re)join every visible room and the currently selected room.
      joinedJobsRef.current.clear();
      visibleJobIdsRef.current.forEach((id) => joinRoom(s, id));
      const selected = selectedJobIdRef.current;
      if (selected) joinRoom(s, selected);
    });

    s.on('disconnect', () => {
      setSocketConnected(false);
      joinedJobsRef.current.clear();
    });

    s.on('connect_error', (err) => {
      setSocketConnected(false);
      // Most common cause: stale/expired access token. Trigger a refresh and let
      // socket.io reconnect; the auth() callback above will pick up the new token.
      if (/auth/i.test(err.message)) {
        api.auth.refresh().catch(() => undefined);
      }
    });

    s.on('receive_message', (msg: ChatMessage) => {
      setJobActivityMap((prev) => ({ ...prev, [msg.jobId]: Date.now() }));
      queryClient.invalidateQueries({ queryKey: ['messages', 'jobs'] });

      if (msg.jobId !== selectedJobIdRef.current) {
        setUnreadByJob((prev) => ({ ...prev, [msg.jobId]: (prev[msg.jobId] ?? 0) + 1 }));
        return;
      }

      setMessages((prev) => {
        // 1) If we already have the canonical id, ignore duplicate.
        if (prev.some((m) => m.id === msg.id)) return prev;

        // 2) If this is our own message echoed back, swap the optimistic row in place.
        if (msg.clientId) {
          const idx = prev.findIndex((m) => m.id === msg.clientId);
          if (idx !== -1) {
            const next = prev.slice();
            next[idx] = msg;
            return next;
          }
        }
        return [...prev, msg];
      });
    });

    s.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    s.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [joinRoom, queryClient]);

  // Join the currently selected room when it changes (independent of mount cycle).
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !s.connected || !selectedJobId) return;
    if (joinedJobsRef.current.has(selectedJobId)) return;
    joinRoom(s, selectedJobId);
  }, [selectedJobId, socketConnected, joinRoom]);

  // Join all visible chat rooms so messages from any job can reorder the sidebar.
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !s.connected) return;
    visibleJobIds.forEach((id) => {
      if (!joinedJobsRef.current.has(id)) joinRoom(s, id);
    });
  }, [visibleJobIds, socketConnected, joinRoom]);

  // FIX: Scroll specifically the container, not the window/page
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const handleSend = async () => {
    if (!pendingMessage.trim() || !selectedJobId) return;

    const text = pendingMessage.trim();
    setPendingMessage('');
    setJobActivityMap((prev) => ({ ...prev, [selectedJobId]: Date.now() }));

    // Stable client-side id, echoed back by the server so we can dedupe atomically.
    const clientId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMessage: ChatMessage = {
      id: clientId,
      clientId,
      jobId: selectedJobId,
      senderId: user?.id ?? 'me',
      senderName: user?.name ?? 'Me',
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    const s = socketRef.current;
    const revertOnFailure = (errorMsg: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== clientId));
      toast.error(errorMsg);
    };

    if (s && s.connected) {
      s.timeout(8000).emit(
        'send_message',
        { jobId: selectedJobId, message: text, clientId },
        (err: Error | null, ack?: SocketAck) => {
          if (err) {
            revertOnFailure('Message timed out — please try again');
            return;
          }
          if (!ack?.ok) {
            revertOnFailure(ack?.error || 'Failed to send');
          }
          // On success the canonical message will arrive via `receive_message`
          // and replace this optimistic row in place.
        }
      );
      return;
    }

    // Socket is down — fall back to the REST endpoint so the message still lands.
    try {
      const { data } = await api.messages.send(selectedJobId, text);
      if (data.success && data.data) {
        const real = data.data as ChatMessage;
        setMessages((prev) =>
          prev.map((m) => (m.id === clientId ? { ...real, clientId } : m))
        );
        queryClient.invalidateQueries({ queryKey: ['messages', 'jobs'] });
      } else {
        revertOnFailure(data.message || 'Failed to send');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to send';
      revertOnFailure(msg);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedJobId) return;
    const previousMessages = messages;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    const restore = () => {
      setMessages(previousMessages);
      toast.error('Failed to delete message');
    };

    const s = socketRef.current;
    if (s && s.connected) {
      s.timeout(8000).emit(
        'delete_message',
        { jobId: selectedJobId, messageId },
        (err: Error | null, ack?: SocketAck) => {
          if (err || !ack?.ok) restore();
        }
      );
      return;
    }

    try {
      await api.messages.delete(messageId);
    } catch (err) {
      console.error('Delete failed', err);
      restore();
      queryClient.invalidateQueries({ queryKey: ['messages', 'history', selectedJobId] });
    }
  };

  const selectConversation = (id: string, e?: React.MouseEvent) => {
    // Prevent default button behavior that might scroll page
    if (e) e.preventDefault();
    setSelectedJobId(id);
    setJobActivityMap((prev) => ({ ...prev, [id]: Date.now() }));
    setUnreadByJob((prev) => ({ ...prev, [id]: 0 }));
    if (isMobileView) setShowSidebarOnMobile(false);
  };

  const handleOpenJD = () => {
    if (!selectedJobId) return;
    router.push(`/dashboard/jobs/${selectedJobId}`);
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      {/* Container height adjusted to fit within dashboard without causing parent scrollbar jumping */}
      <div className="-mx-4 -mt-8 sm:-mx-8 sm:-mt-12 lg:-mx-12 flex bg-white border-y border-slate-200 overflow-hidden h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] relative">
        {/* Sidebar: Premium & Modern */}
        <aside className={`
          ${(isMobileView && !showSidebarOnMobile) || (focusCandidate && !isMobileView) ? 'hidden' : 'flex'}
          flex-col w-full md:w-[320px] lg:w-[360px] border-r border-slate-200 bg-white shrink-0
          transition-all duration-300 ease-in-out
        `}>
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Messages</h1>
              <div className="flex -space-x-2 overflow-hidden">
                {onlineUsers.slice(0, 3).map((ou) => (
                  <div key={ou.id} className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600" title={ou.name}>
                    {ou.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-[10px] font-black text-gray-400 ring-2 ring-white">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium placeholder:text-slate-400 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2.5 bg-slate-50/40">
            {loadingJobs ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white animate-pulse border border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="flex-1 py-1 space-y-2">
                      <div className="h-4 w-2/3 bg-slate-100 rounded" />
                      <div className="h-3 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-100 flex items-center justify-center mb-6 shadow-sm opacity-60">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-300 px-8">Start a discussion with your team</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {filteredJobs.map((job, index) => {
                  const isActive = job.id === selectedJobId;
                  const unreadCount = unreadByJob[job.id] ?? 0;
                  const recruiterNames = job.recruiters.map(r => r.name).join(', ');
                  const initials = job.title.slice(0, 2).toUpperCase();
                  const lastMessageTime = formatSidebarTime(job.lastMessageAt);

                  return (
                    <button
                      key={job.id}
                      onClick={(e) => selectConversation(job.id, e)}
                      className={`
                        w-full group flex items-start gap-3 px-3 py-3 transition-all duration-150 relative text-left border-l-2
                        ${isActive
                          ? 'bg-blue-50/60 border-l-blue-600'
                          : 'bg-white border-l-transparent hover:bg-slate-50'
                        }
                      `}
                    >
                      {index !== 0 && (
                        <span className="absolute left-3 right-3 top-0 h-px bg-slate-100" />
                      )}
                      <div className="relative shrink-0">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[13px] tracking-tight overflow-hidden transition-all duration-200
                          ${isActive
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-500 group-hover:border-blue-200 group-hover:text-blue-600'
                          }
                        `}>
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black">{initials}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start mb-0.5 gap-2">
                          <h3 className="text-[14px] font-semibold truncate tracking-tight text-slate-900">
                            {job.title}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-[10px] font-medium text-slate-400 shrink-0">{lastMessageTime}</span>
                          )}
                          {unreadCount > 0 && (
                            <span className="ml-2 inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-black leading-none">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[12px] text-slate-500 font-medium truncate tracking-tight">
                            {job.companyName}
                          </p>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <p className="text-[10px] text-slate-600 font-medium tracking-wide truncate">
                              {recruiterNames || 'Active Mandate'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Content */}
        <main className={`
          flex-1 flex flex-col min-w-0 bg-white relative
          ${isMobileView && showSidebarOnMobile ? 'hidden' : 'flex'}
        `}>
          {!selectedJob ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-[#111827] mb-2 tracking-tight">Select a Chat</h2>
              <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed">
                Connect with candidates and recruitment teams by selecting a conversation from the left.
              </p>
            </div>
          ) : (
            <>
              {/* Header: Refined and Clean */}
              <header className="h-[76px] shrink-0 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-5 min-w-0">
                  {isMobileView && (
                    <button
                      onClick={() => setShowSidebarOnMobile(true)}
                      className="p-2.5 hover:bg-slate-100 rounded-xl transition-all -ml-1 text-slate-500 active:scale-90 shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="min-w-0 flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 border border-slate-200 flex items-center justify-center text-white font-black text-[14px] overflow-hidden shadow-sm">
                        {selectedJob.companyLogo ? (
                          <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className="w-full h-full object-cover" />
                        ) : selectedJob.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[17px] font-black text-slate-900 truncate tracking-tight mb-0.5">
                        {selectedJob.title}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-0">
                          <Building2 className="w-3.5 h-3.5 opacity-50 shrink-0" />
                          <span className="truncate">{selectedJob.companyName}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        {socketConnected ? (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1.5">
                            <WifiOff className="w-3 h-3" />
                            Reconnecting…
                          </span>
                        )}
                      </div>
                      {focusCandidate && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                            Candidate Chat
                            <span className="max-w-[220px] truncate">{focusCandidateName || focusRoleTitle || selectedJob.title}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {focusCandidate && (
                    <button
                      onClick={() => router.push('/dashboard/messages')}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all whitespace-nowrap"
                    >
                      All Chats
                    </button>
                  )}
                  <button
                    onClick={handleOpenJD}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 uppercase tracking-wider hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all whitespace-nowrap"
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    Job Info
                  </button>
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all active:scale-95 shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Messages Body */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-8 py-6 space-y-10 bg-slate-50/40 custom-scrollbar scroll-smooth"
              >
                <AnimatePresence mode="popLayout">
                  {loadingHistory && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pt-10">
                      <div className="w-12 h-12 border-[4px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-6" />
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Loading conversation...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 select-none grayscale">
                      <MessageSquare className="w-20 h-20 mb-8 stroke-[1px]" />
                      <p className="text-[12px] font-black uppercase tracking-[0.5em]">No History Found</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showDate = idx === 0 ||
                          format(new Date(messages[idx - 1].createdAt), 'yyyy-MM-dd') !== format(new Date(msg.createdAt), 'yyyy-MM-dd');

                        return (
                          <div key={msg.id} className="space-y-6">
                            {showDate && (
                            <div className="flex items-center gap-6 py-5">
                              <div className="h-px bg-slate-200 flex-1" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white px-3">
                                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                </span>
                              <div className="h-px bg-slate-200 flex-1" />
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex group relative ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex flex-col max-w-[90%] sm:max-w-[74%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 mb-2 px-1.5 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <div className="flex items-center gap-2">
                                    {!isMe && (
                                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                        {msg.senderName}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {format(new Date(msg.createdAt), 'h:mm a')}
                                    </span>
                                  </div>

                                  {(isMe || user?.role === 'admin') && (
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className={`
                                  px-5 py-3.5 text-[14px] leading-[1.6] font-medium shadow-sm transition-all border
                                  ${isMe
                                    ? 'bg-slate-900 text-white border-slate-900 rounded-2xl rounded-br-md'
                                    : 'bg-slate-50 text-slate-800 border-slate-200 rounded-2xl rounded-bl-md'
                                  }
                                `}>
                                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                                {isMe && (
                                  <div className="mt-1.5 flex items-center gap-1.5 text-blue-600 px-1.5 opacity-70">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Delivered</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
                <div className="h-4 w-full" />
              </div>

              {/* Input Area */}
          <footer className="p-3 md:p-4 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 focus-within:border-blue-400 transition-all duration-150 group">
                    <textarea
                      value={pendingMessage}
                      onChange={(e) => setPendingMessage(e.target.value)}
                      rows={1}
                      placeholder="Collaborate on this role..."
                      className="flex-1 bg-transparent border-none px-2 py-2 text-[14px] font-medium outline-none focus:outline-none focus-visible:outline-none focus:ring-0 resize-none max-h-40 custom-scrollbar placeholder:text-slate-400 text-slate-900 leading-relaxed"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!pendingMessage.trim() || !selectedJobId}
                      className="shrink-0 w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all duration-200"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 opacity-50 select-none">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Encrypted Channel</span>
                  </div>
                </div>
              </footer>
            </>
          )}
        </main>
      </div>
    </RouteGuard>
  );
}
