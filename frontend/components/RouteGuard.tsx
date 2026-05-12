'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@ats-saas/shared';
import { PageSpinner } from '@/components/ui/PageSpinner';

type RouteGuardProps = {
  /** Allowed roles for this route. User must have one of these roles. */
  allowedRoles: UserRole[];
  /** Where to redirect when role is not allowed (default: /dashboard) */
  redirectTo?: string;
  children: React.ReactNode;
};

/**
 * Route guard: restricts access by role. Use on pages that require specific roles.
 * RBAC: admin (all), recruiter (assigned jobs). Only admin and recruiter roles supported.
 */
export function RouteGuard({ allowedRoles, redirectTo = '/dashboard', children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const hasAccess = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, hasAccess, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PageSpinner size="md" variant="light" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
