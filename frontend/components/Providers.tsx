'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NavigationRouteLoader } from '@/components/NavigationRouteLoader';

import 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
        <GlobalSearchProvider>
          <Suspense fallback={null}>
            <NavigationRouteLoader />
          </Suspense>
          {children}
        </GlobalSearchProvider>
        </NotificationProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'animate-toast-slide-left',
            duration: 4000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderRadius: '0.75rem',
              padding: '16px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
