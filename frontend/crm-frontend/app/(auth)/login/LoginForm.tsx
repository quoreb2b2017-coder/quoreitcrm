'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { loginSchema, type LoginInput } from '@/validations/authSchemas';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { safeAuthRedirect } from '@/utils/navigation';
import { PageSpinner } from '@/components/ui/PageSpinner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = safeAuthRedirect(searchParams.get('redirect'));
  const { login, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(redirectTarget);
  }, [isAuthenticated, router, redirectTarget]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[220px] items-center justify-center animate-fade-in">
        <PageSpinner size="lg" variant="light" />
      </div>
    );
  }

  async function onSubmit(data: LoginInput) {
    setSubmitError(null);
    try {
      await login(data);
      router.push(redirectTarget);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  }

  return (
    <div className="animate-fade-in-up space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[13px] font-medium text-red-700">{submitError}</p>
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
            placeholder="you@company.com"
            {...registerField('email')}
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="label mb-0">Password</label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input-field pr-11 ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
              placeholder="••••••••"
              {...registerField('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3 text-[14px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-[var(--foreground-muted)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
