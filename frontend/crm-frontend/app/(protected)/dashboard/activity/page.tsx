'use client';

import { RouteGuard } from '@/components/RouteGuard';
import { CandidateCallsPanel } from '@/components/activity/CandidateCallsPanel';

export default function CallsPage() {
  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="min-h-screen bg-white flex flex-col">
        <CandidateCallsPanel />
      </div>
    </RouteGuard>
  );
}
