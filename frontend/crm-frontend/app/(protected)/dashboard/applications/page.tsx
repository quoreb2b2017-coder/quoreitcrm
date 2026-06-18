'use client';

import Link from 'next/link';
import { RouteGuard } from '@/components/RouteGuard';

export default function ApplicationsPage() {
  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
    <div className="space-y-5 sm:space-y-6">
      <div className="min-w-0">
        <h1 className="text-display text-2xl text-[var(--foreground)] sm:text-3xl">Applications</h1>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)] sm:mt-2">
          View and manage applications by job. Use the Applicants page for the hiring pipeline.
        </p>
      </div>
      <div className="panel empty-state py-10 sm:py-12">
        <p className="text-sm text-[var(--muted-foreground)]">View applications per job from the <Link href="/dashboard/applicants" className="font-medium text-[var(--primary)] underline">Applicants</Link> page.</p>
      </div>
    </div>
    </RouteGuard>
  );
}
