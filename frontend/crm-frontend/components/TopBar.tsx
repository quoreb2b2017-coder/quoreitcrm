'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Bell, ChevronDown, LogOut, UserCircle, Search } from 'lucide-react';
import { resolvePageTitle } from '@/utils/pageTitles';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useNotifications } from '@/contexts/NotificationContext';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();
  const { setOpen: openGlobalSearch } = useGlobalSearch();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const canUseNotifications = hasRole('admin') || hasRole('recruiter');
  const { unreadByJob, totalUnread, markJobRead, markAllRead } = useNotifications();

  type NavbarChatJob = { id: string; title: string; companyName: string; };

  const { data: notificationJobs = [] } = useQuery({
    queryKey: ['topbar', 'notifications', 'jobs'],
    queryFn: async () => {
      const res = await api.messages.listJobs();
      return (res.data?.data ?? []) as NavbarChatJob[];
    },
    enabled: canUseNotifications,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const unreadNotifications = notificationJobs.filter((job) => (unreadByJob[job.id] ?? 0) > 0);
  const unreadCount = totalUnread;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!profileOpen && !notifOpen) return;
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') { setProfileOpen(false); setNotifOpen(false); }
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [profileOpen, notifOpen]);

  const pageTitle = resolvePageTitle(pathname);
  const modKey =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? '⌘' : 'Ctrl';
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="topbar h-[58px]">
      {/* Left: page title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Global search: compact on smaller screens, full trigger on xl */}
        <button
          type="button"
          onClick={() => openGlobalSearch(true)}
          className="btn-icon xl:hidden hover-glow"
          aria-label="Open search"
        >
          <Search size={18} />
        </button>
        <button
          type="button"
          onClick={() => openGlobalSearch(true)}
          className="hidden xl:flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground-subtle)] hover:border-[var(--border-strong)] transition-colors"
          style={{ width: 220 }}
        >
          <Search size={14} />
          <span className="flex-1 text-left text-[13px]">Search…</span>
          <kbd className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">
            {modKey}+K
          </kbd>
        </button>

        {/* Notifications */}
        {canUseNotifications && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((p) => !p)}
              className="btn-icon relative hover-glow"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[360px] rounded-[var(--radius-2xl)] border border-[var(--border)] bg-white shadow-lg z-50 overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-slate-50/70 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllRead}
                      disabled={unreadCount === 0}
                      className="text-xs font-medium text-[var(--brand)] hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto p-3 custom-scrollbar">
                    {unreadNotifications.length === 0 ? (
                      <div className="empty-state py-10">
                        <Bell size={24} className="text-[var(--foreground-subtle)] mb-3" />
                        <p className="text-sm font-medium text-[var(--foreground-muted)]">No new notifications</p>
                        <p className="text-xs text-[var(--foreground-subtle)] mt-1">You are all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unreadNotifications.slice(0, 10).map((n) => {
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                markJobRead(n.id);
                                setNotifOpen(false);
                                router.push(`/dashboard/messages?jobId=${encodeURIComponent(n.id)}`);
                              }}
                              className="w-full rounded-[var(--radius-lg)] border border-blue-100 bg-blue-50/60 px-3.5 py-3 text-left transition-all hover:bg-blue-50 hover:border-blue-200 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius)] bg-blue-500 text-white">
                                  <Bell size={13} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{n.title}</p>
                                  <p className="truncate text-xs text-[var(--foreground-muted)]">{n.companyName || 'Team Chat'}</p>
                                  <p className="mt-1.5 text-[11px] text-[var(--foreground-subtle)] flex items-center justify-between">
                                    <span>{unreadByJob[n.id] ?? 0} new message{(unreadByJob[n.id] ?? 0) !== 1 ? 's' : ''}</span>
                                    <span className="text-blue-600 group-hover:underline">View →</span>
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-2.5 py-1.5 transition-all hover:border-[var(--border-strong)] hover:bg-slate-50"
          >
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-[11px] font-bold text-white">
                {initials}
              </div>
              <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <span className="hidden sm:block text-[13px] font-medium text-[var(--foreground)] max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown size={13} className={`text-[var(--foreground-subtle)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-1.5 z-50"
                style={{ boxShadow: 'var(--shadow-lg)' }}
              >
                <div className="mb-1 rounded-[var(--radius-lg)] bg-slate-50 px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-[var(--foreground)] leading-tight truncate">{user?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-blue-600/80 mt-0.5">
                    {roleLabels[user?.role ?? ''] ?? user?.role}
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  scroll={false}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-[13px] font-medium text-[var(--foreground-muted)] hover:bg-slate-50 hover:text-[var(--foreground)] transition-colors"
                >
                  <UserCircle size={15} />
                  My Profile
                </Link>
                <div className="my-1 border-t border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
