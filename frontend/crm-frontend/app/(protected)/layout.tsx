'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { TopBar } from '@/components/TopBar';
import { MainScrollArea } from '@/components/MainScrollArea';
import { PageSpinner } from '@/components/ui/PageSpinner';

function SessionBootLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0f172a]">
      <PageSpinner size="lg" variant="dark" />
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname ?? '/dashboard');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <SessionBootLoader />;
  }

  if (!user) {
    return <SessionBootLoader />;
  }

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[var(--background)] lg:flex-row">
      <DashboardSidebar />

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="hidden shrink-0 lg:block">
          <TopBar />
        </div>

        <MainScrollArea>
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
            {children}
          </div>
        </MainScrollArea>
      </div>
    </div>
  );
}
