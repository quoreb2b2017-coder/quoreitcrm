'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/tokenStore';

/** Internal base link type */
type NavLink = {
  href: string;
  label: string;
  labelAdmin?: string;
  roles?: Array<'admin' | 'recruiter'>;
  icon: React.ReactNode;
};

/** Links displayed in the main navbar for desktop. */
const mainLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { href: '/dashboard/jobs', label: 'Browse', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { href: '/dashboard/candidates', label: 'Candidates', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
  { href: '/dashboard/clients', label: 'Clients', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
  { href: '/dashboard/messages', label: 'Messages', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
  { href: '/dashboard/activity', label: 'Calls', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> },
  { href: '/dashboard/profile', label: 'Profile', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

const moreLinks: NavLink[] = [
  { href: '/dashboard/email', label: 'Email', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { href: '/dashboard/applicants', label: 'Pipeline', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
  { href: '/dashboard/projects', label: 'Projects', roles: ['admin', 'recruiter'], icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /> },
  { href: '/dashboard/settings', label: 'Settings', roles: ['admin', 'recruiter'], icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [seenByJob, setSeenByJob] = useState<Record<string, number>>({});
  const [seenByJobHydrated, setSeenByJobHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const STORAGE_KEY = `ats:seen-notifs:${user?.id ?? 'anon'}`;

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '')
      : 'http://localhost:4000');

  const canUseNotifications = hasRole('admin') || hasRole('recruiter');

  type NavbarChatJob = {
    id: string;
    title: string;
    companyName: string;
    lastMessageAt?: string | null;
  };

  const { data: notificationJobs = [], refetch: refetchNotifJobs } = useQuery({
    queryKey: ['navbar', 'notifications', 'jobs'],
    queryFn: async () => {
      const res = await api.messages.listJobs();
      return (res.data?.data ?? []) as NavbarChatJob[];
    },
    enabled: canUseNotifications,
    refetchInterval: 5000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (!user?.id) return;
    setSeenByJobHydrated(false);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        // Coerce any stored values to numbers to prevent "string ts" bugs.
        const coerced: Record<string, number> = {};
        Object.entries(parsed).forEach(([k, v]) => {
          const num = typeof v === 'number' ? v : Number(v);
          if (!Number.isNaN(num)) coerced[k] = num;
        });
        setSeenByJob(coerced);
      } else {
        setSeenByJob({});
      }
    } catch {
      // ignore parse issues
    } finally {
      setSeenByJobHydrated(true);
    }
  }, [STORAGE_KEY, user?.id]);

  useEffect(() => {
    if (!user?.id || !seenByJobHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seenByJob));
  }, [STORAGE_KEY, seenByJob, user?.id]);

  useEffect(() => {
    if (!notifOpen) return;
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!canUseNotifications) return;
    const token = getAccessToken();
    if (!token) return;
    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = s;
    s.on('receive_message', () => {
      refetchNotifJobs();
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [SOCKET_URL, canUseNotifications, refetchNotifJobs]);

  const parseTimestamp = (value?: string | number | null) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const notifications = (notificationJobs ?? [])
    .filter((j) => !!j.lastMessageAt)
    .map((j) => {
      const ts = parseTimestamp(j.lastMessageAt);
      const seen = Number(seenByJob[j.id] ?? 0) || 0;
      return {
        ...j,
        ts,
        isUnread: ts > seen,
      };
    })
    .sort((a, b) => b.ts - a.ts);

  const unreadCount = notifications.reduce((acc, n) => acc + (n.isUnread ? 1 : 0), 0);
  const unreadNotifications = notifications.filter((n) => n.isUnread);

  const formatNotificationDate = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isSameDay) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Mark as read by persisting the notification's lastMessageAt timestamp.
  // This prevents it from coming back to "unread" on refresh/refetch.
  const markNotificationRead = (jobId: string, ts: number) => {
    const safeTs = parseTimestamp(ts);
    if (!safeTs) return;
    const previous = Number(seenByJob[jobId] ?? 0) || 0;
    const next = { ...seenByJob, [jobId]: Math.max(previous, safeTs) };
    setSeenByJob(next);
    try {
      // Persist immediately so route changes cannot drop this write.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore localStorage issues
    }
  };

  const markAllRead = () => {
    const next: Record<string, number> = { ...seenByJob };
    notifications.forEach((n) => {
      const safeTs = parseTimestamp(n.ts);
      next[n.id] = Math.max(Number(next[n.id] ?? 0) || 0, safeTs);
    });
    setSeenByJob(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    // Close the dropdown after marking read.
    setNotifOpen(false);
  };

  const handleNavStart = (href: string) => {
    if (!href) return;
    if (pathname === href || (href.startsWith('/dashboard/messages') && pathname.startsWith('/dashboard/messages'))) return;
    setPendingHref(href);
  };

  // Handle outside clicks and hover logic
  let closeTimeout: NodeJS.Timeout;
  const handleMouseEnter = () => {
    clearTimeout(closeTimeout);
    setMenuOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => setMenuOpen(false), 150);
  };

  const visibleMain = mainLinks.filter(
    (link) => !link.roles || link.roles.some((role) => hasRole(role))
  );

  const visibleMore = moreLinks.filter(
    (link) => !link.roles || link.roles.some((role) => hasRole(role))
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <AnimatePresence>
        {pendingHref && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0.7 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pointer-events-none absolute left-0 top-0 h-0.5 w-full origin-left bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
          />
        )}
      </AnimatePresence>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 h-16">
        <div className="flex items-center gap-4 xl:gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg"
            >
              A
            </motion.div>
            <span className="hidden text-xl font-black tracking-tighter text-gray-900 sm:inline">ATS</span>
          </Link>

          <div className="hidden gap-0.5 lg:flex items-center">
            {visibleMain.map((link) => {
              const isActive = pathname === link.href;
              const label = link.labelAdmin && hasRole('admin') ? link.labelAdmin : link.label;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavStart(link.href)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-[12px] xl:text-[13px] font-black uppercase tracking-widest transition-all duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 z-0 rounded-lg bg-blue-50/80"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                  {pendingHref === link.href && (
                    <span className="relative z-10 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  )}
                </Link>
              );
            })}

            {/* Menu Dropdown */}
            <div
              className="relative ml-1"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 text-[12px] xl:text-[13px] font-black uppercase tracking-widest transition-all duration-300 rounded-lg ${menuOpen ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-900'}`}
              >
                More
                <motion.svg
                  animate={{ rotate: menuOpen ? 180 : 0 }}
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-[220px] p-2 origin-top-right rounded-2xl border border-gray-100 bg-white/95 shadow-2xl z-50 backdrop-blur-xl"
                  >
                    <div className="space-y-1">
                      {visibleMore.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => handleNavStart(link.href)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${pathname === link.href ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group'}`}
                        >
                          <svg className={`h-5 w-5 transition-transform group-hover:scale-110 ${pathname === link.href ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{link.icon}</svg>
                          {link.label}
                          {pendingHref === link.href && (
                            <span className="ml-auto inline-flex h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          )}
                        </Link>
                      ))}
                      {hasRole('admin') && (
                        <Link
                          href="/dashboard/add-candidate"
                          onClick={() => handleNavStart('/dashboard/add-candidate')}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${pathname === '/dashboard/add-candidate' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group'}`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Add User
                          {pendingHref === '/dashboard/add-candidate' && (
                            <span className="ml-auto inline-flex h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          )}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden transition-all active:scale-90"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.div
              animate={{ rotate: mobileOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.div>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="relative hidden sm:block" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((p) => !p)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-black leading-none ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-3 w-[380px] rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white px-5 py-4">
                    <div>
                      <p className="text-base font-black tracking-tight text-slate-900">Notifications</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={unreadCount === 0}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-3">
                    {unreadNotifications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-12 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-700">All caught up</p>
                        <p className="mt-1 text-[12px] text-slate-500">No unread notifications right now.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unreadNotifications.slice(0, 12).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              markNotificationRead(n.id, n.ts);
                              setNotifOpen(false);
                              handleNavStart('/dashboard/messages');
                              router.push(`/dashboard/messages?jobId=${encodeURIComponent(n.id)}`);
                            }}
                            className="group w-full rounded-2xl border border-blue-100/70 bg-gradient-to-r from-blue-50/70 via-white to-white px-4 py-3 text-left shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(37,99,235,0.16)]"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-100/70">
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                                </svg>
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate pr-2 text-[14px] font-black text-slate-900">{n.title}</p>
                                  <span className="shrink-0 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-800">
                                    New
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-600">{n.companyName || 'Team Chat'}</p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-semibold text-slate-500">
                                    {formatNotificationDate(n.ts)}
                                  </p>
                                  <span className="text-[11px] font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5">
                                    Open chat →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative hidden sm:block" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((p) => !p)}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 hover:bg-slate-50 shadow-sm transition-all"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-black text-white shadow-sm ring-2 ring-blue-100">
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0 pr-1 shrink-0 text-left">
                <p className="truncate text-sm font-black text-gray-900 leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black text-blue-600/80">
                  {roleLabels[user?.role ?? ''] ?? user?.role}
                </p>
              </div>
              <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-56 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50"
                >
                    <div className="mx-1 mb-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                      <p className="truncate text-[13px] font-black text-slate-900 leading-tight">{user?.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-widest font-black text-blue-700/80">
                        {roleLabels[user?.role ?? ''] ?? user?.role}
                      </p>
                    </div>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavStart('/dashboard/profile');
                    }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                    </svg>
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="absolute left-0 right-0 top-full z-[100] overflow-hidden border-b border-gray-100 bg-white shadow-2xl lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <div className="mx-auto flex flex-col gap-8 px-6 py-8">
              {/* Main Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Main Navigation</p>
                <div className="grid gap-2">
                  {visibleMain.map((link) => {
                    const isActive = pathname === link.href;
                    const label = link.labelAdmin && hasRole('admin') ? link.labelAdmin : link.label;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setMobileOpen(false);
                          handleNavStart(link.href);
                        }}
                        className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 group'}`}
                      >
                        <svg className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{link.icon}</svg>
                        {label}
                        {pendingHref === link.href && (
                          <span className="ml-auto inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* More Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">More Services</p>
                <div className="grid gap-2">
                  {visibleMore.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setMobileOpen(false);
                        handleNavStart(link.href);
                      }}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 group'}`}
                    >
                      <svg className={`h-5 w-5 ${pathname === link.href ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{link.icon}</svg>
                      {link.label}
                      {pendingHref === link.href && (
                        <span className="ml-auto inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                    </Link>
                  ))}
                  {hasRole('admin') && (
                    <Link
                      href="/dashboard/add-candidate"
                      onClick={() => {
                        setMobileOpen(false);
                        handleNavStart('/dashboard/add-candidate');
                      }}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${pathname === '/dashboard/add-candidate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 group'}`}
                    >
                      <svg className={`h-5 w-5 ${pathname === '/dashboard/add-candidate' ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add User
                      {pendingHref === '/dashboard/add-candidate' && (
                        <span className="ml-auto inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
