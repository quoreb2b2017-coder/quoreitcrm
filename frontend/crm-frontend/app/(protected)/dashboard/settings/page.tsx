'use client';

import { RouteGuard } from '@/components/RouteGuard';

export default function SettingsPage() {
  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="space-y-5 sm:space-y-6">
        <div className="min-w-0">
          <h1 className="text-display text-2xl text-[var(--foreground)] sm:text-3xl">Settings</h1>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)] sm:mt-2">
            Admin settings and configuration.
          </p>
        </div>
        <div className="panel p-5 sm:p-8">
          <p className="text-sm text-[var(--muted-foreground)]">Settings options will appear here.</p>
        </div>
      </div>
    </RouteGuard>
  );
}
