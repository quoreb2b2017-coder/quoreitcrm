'use client';

import { PublicNavbar } from '@/components/PublicNavbar';
import { Footer } from '@/components/Footer';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModals } from '@/components/AuthModals';

export function MarketingWithModals({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider>
      <div className="flex min-h-screen flex-col gradient-mesh">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <AuthModals />
    </AuthModalProvider>
  );
}
