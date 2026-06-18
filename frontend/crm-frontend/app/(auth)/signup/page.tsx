'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { registerSchema, type RegisterInput } from '@/validations/authSchemas';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function SignupPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace('/dashboard');
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[220px] items-center justify-center animate-fade-in">
        <PageSpinner size="lg" variant="light" />
      </div>
    );
  }

  async function onSubmit(data: RegisterInput) {
    setSubmitError(null);
    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  }

  return (
    <div className="animate-fade-in-up space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
          Get started with QuoreIt CRM for free
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[13px] font-medium text-red-700">{submitError}</p>
          </div>
        )}

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="name" className="label">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            placeholder="Jane Doe"
            {...registerField('name')}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">Work email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-400' : ''}`}
            placeholder="you@company.com"
            {...registerField('email')}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pr-11 ${errors.password ? 'border-red-400' : ''}`}
              placeholder="At least 8 characters"
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
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3 text-[14px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-[11px] text-[var(--foreground-subtle)]">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="text-center text-[13px] text-[var(--foreground-muted)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
