import { Suspense } from 'react';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { LoginForm } from './LoginForm';

function LoginFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <PageSpinner size="lg" variant="light" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
