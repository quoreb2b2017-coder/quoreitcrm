'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/login');
  }, [router]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/60 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          prefetch
          className="flex shrink-0 items-center gap-2.5 font-bold text-[var(--foreground)] transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-blue-500 shadow-sm">
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
          <span className="text-[16px] tracking-tight">QuoreIt</span>
          <span className="hidden sm:inline-flex text-[10px] font-semibold text-blue-500/80 border border-blue-200 rounded-full px-2 py-0.5">CRM</span>
        </Link>

        {/* CTA — no duplicate Home / Sign in row; logo already goes home */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-primary text-[13px]">
              Sign in
            </Link>
          )}

          {/* Mobile menu: guests only (signed-in users have dashboard CTA) */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="btn-icon md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu — guests only */}
      <AnimatePresence>
        {mobileOpen && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--border)] bg-white px-5 pb-5 pt-4 md:hidden"
          >
            <div className="space-y-1">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-[14px] font-medium text-[var(--foreground-muted)] hover:bg-slate-50 hover:text-[var(--foreground)]"
              >
                Log in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
