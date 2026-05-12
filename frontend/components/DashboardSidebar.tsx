'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { resolvePageTitle } from '@/utils/pageTitles';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserRole } from '@/types';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  FolderKanban,
  MessageSquare,
  Phone,
  Mail,
  KanbanSquare,
  Settings,
  UserCircle,
  UserPlus,
  LogOut,
  Menu,
  Search,
  X,
  Zap,
} from 'lucide-react';

const ICON = 18;

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Array<'admin' | 'recruiter'>;
};

const primaryNav: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={ICON} strokeWidth={1.75} />,
  },
  {
    href: '/dashboard/jobs',
    label: 'Jobs',
    icon: <Briefcase size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/candidates',
    label: 'Candidates',
    icon: <Users size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/applicants',
    label: 'Pipeline',
    icon: <KanbanSquare size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/clients',
    label: 'Clients',
    icon: <Building2 size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/projects',
    label: 'Projects',
    icon: <FolderKanban size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
];

const secondaryNav: NavItem[] = [
  {
    href: '/dashboard/messages',
    label: 'Messages',
    icon: <MessageSquare size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/activity',
    label: 'Calls',
    icon: <Phone size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/email',
    label: 'Email',
    icon: <Mail size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
];

const accountNav: NavItem[] = [
  {
    href: '/dashboard/profile',
    label: 'My Profile',
    icon: <UserCircle size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: <Settings size={ICON} strokeWidth={1.75} />,
    roles: ['admin', 'recruiter'],
  },
  {
    href: '/dashboard/add-candidate',
    label: 'Add User',
    icon: <UserPlus size={ICON} strokeWidth={1.75} />,
    roles: ['admin'],
  },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
};

function NavSection({
  items,
  label,
  pathname,
  hasRole,
  onClick,
}: {
  items: NavItem[];
  label?: string;
  pathname: string;
  hasRole: (...r: UserRole[]) => boolean;
  onClick?: () => void;
}) {
  const visible = items.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  );
  if (!visible.length) return null;

  return (
    <div>
      {label && (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {visible.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              prefetch
              onClick={onClick}
              className={`sidebar-item group overflow-hidden ${
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-rail"
                  className="absolute left-1.5 top-1/2 z-10 h-7 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-400 to-blue-500 shadow-[0_0_14px_rgba(56,189,248,0.55)]"
                  transition={{ type: 'spring', bounce: 0.22, stiffness: 380, damping: 28 }}
                />
              )}
              <span
                className={`relative z-10 ml-1 shrink-0 transition-colors duration-200 ${
                  isActive
                    ? 'text-sky-300'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.icon}
              </span>
              <span className="relative z-10 flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const { setOpen: openGlobalSearch } = useGlobalSearch();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [mobileOpen]);

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const roleLabel = roleLabels[user?.role ?? ''] ?? user?.role ?? '';
  const mobileTitle = resolvePageTitle(pathname);

  const sidebarContent = (
    <aside className="relative flex h-full w-[264px] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#0b1220] shadow-[inset_-1px_0_0_rgb(255_255_255/0.04)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-500/[0.07] to-transparent"
        aria-hidden
      />
      {/* Logo */}
      <div className="relative flex h-[3.75rem] shrink-0 items-center gap-3 px-4 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_4px_14px_-2px_rgba(37,99,235,0.55),inset_0_1px_0_rgb(255_255_255/0.15)] ring-1 ring-white/10">
          <Zap size={17} className="text-white" fill="currentColor" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold tracking-tight text-white">QuoreIt</span>
          <span className="text-[11px] font-medium text-slate-500">Recruitment CRM</span>
        </div>
        <span className="shrink-0 rounded-lg border border-sky-500/20 bg-sky-500/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300/80">
          CRM
        </span>
      </div>

      {/* User avatar */}
      <div className="relative px-3 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.07] backdrop-blur-sm transition-colors hover:bg-white/[0.055]">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-[13px] font-bold text-white shadow-lg shadow-blue-900/40 ring-2 ring-white/15">
            {initials}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0f172a] bg-emerald-400 shadow-sm" title="Online" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-white leading-tight">
              {user?.name ?? 'Workspace'}
            </p>
            {user?.email ? (
              <p className="mt-0.5 truncate text-xs text-slate-400">{user.email}</p>
            ) : null}
            {roleLabel ? (
              <p className="mt-1 inline-flex rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300/85 ring-1 ring-white/[0.06]">
                {roleLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 py-5 custom-scrollbar">
        <NavSection
          items={primaryNav}
          label="Workspace"
          pathname={pathname}
          hasRole={hasRole}
          onClick={() => setMobileOpen(false)}
        />
        <NavSection
          items={secondaryNav}
          label="Communication"
          pathname={pathname}
          hasRole={hasRole}
          onClick={() => setMobileOpen(false)}
        />
        <NavSection
          items={accountNav}
          label="Account"
          pathname={pathname}
          hasRole={hasRole}
          onClick={() => setMobileOpen(false)}
        />
      </nav>

      {/* Sign out */}
      <div className="relative shrink-0 border-t border-white/[0.06] bg-[#0b1220]/80 px-3 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => { setMobileOpen(false); logout(); }}
          className="sidebar-item sidebar-item-inactive group w-full rounded-xl border border-transparent hover:!translate-x-0 hover:!border-red-500/20 hover:!bg-red-500/[0.08] hover:!text-red-300 active:!translate-x-0 active:!scale-[0.98]"
        >
          <LogOut size={ICON} strokeWidth={1.75} className="shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
          <span className="text-[13px] font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — own column on lg+ */}
      <div className="hidden h-full w-[264px] shrink-0 lg:block lg:h-full">
        {sidebarContent}
      </div>

      {/* Mobile top bar — full width above main (parent uses flex-col below lg breakpoint) */}
      <header className="sticky top-0 z-30 flex h-[52px] w-full shrink-0 items-center gap-1 border-b border-[var(--border)] bg-white/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-icon shrink-0 touch-manipulation"
          aria-label="Open navigation menu"
        >
          <Menu size={22} strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => openGlobalSearch(true)}
          className="btn-icon shrink-0 touch-manipulation"
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center leading-tight">
          <span className="max-w-full truncate text-[14px] font-semibold tracking-tight text-[var(--foreground)]">
            {mobileTitle}
          </span>
          <span className="max-w-full truncate text-[10px] font-medium text-[var(--foreground-muted)]">
            QuoreIt CRM
          </span>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white/90 touch-manipulation"
          aria-hidden
        >
          {initials}
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-[264px] max-w-[min(264px,92vw)] shadow-[8px_0_40px_-12px_rgb(0_0_0/0.65)]"
            >
              {sidebarContent}
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur touch-manipulation"
              aria-label="Close menu"
            >
              <X size={18} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
