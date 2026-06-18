'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getErrorMessage } from '@/utils/errorHandler';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/validations/authSchemas';
import { Modal } from '@/components/ui/Modal';

export function AuthModals() {
  const router = useRouter();
  const { loginOpen, signupOpen, closeLogin, closeSignup, openSignup, openLogin } = useAuthModal() ?? {};
  const { login, register: registerUser } = useAuth();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  async function onLoginSubmit(data: LoginInput) {
    setLoginError(null);
    try {
      await login(data);
      closeLogin?.();
      router.push('/dashboard');
    } catch (err) {
      setLoginError(getErrorMessage(err));
    }
  }

  async function onSignupSubmit(data: RegisterInput) {
    setSignupError(null);
    try {
      await registerUser(data);
      closeSignup?.();
      router.push('/dashboard');
    } catch (err) {
      setSignupError(getErrorMessage(err));
    }
  }

  if (!loginOpen && !signupOpen) return null;

  return (
    <>
      <Modal isOpen={!!loginOpen} onClose={closeLogin ?? (() => {})} title="Sign in">
        <div className="space-y-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Use your email and password to sign in.
          </p>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            {loginError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {loginError}
              </div>
            )}
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="modal-email"
                type="email"
                autoComplete="email"
                className="input-field mt-1.5"
                placeholder="you@example.com"
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="modal-password" className="block text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <input
                id="modal-password"
                type="password"
                autoComplete="current-password"
                className="input-field mt-1.5"
                placeholder="••••••••"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="btn-primary w-full"
            >
              {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => { closeLogin?.(); openSignup?.(); }}
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </Modal>

      <Modal isOpen={!!signupOpen} onClose={closeSignup ?? (() => {})} title="Create account">
        <div className="space-y-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Sign up with your email and a strong password.
          </p>
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
            {signupError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {signupError}
              </div>
            )}
            <div>
              <label htmlFor="modal-name" className="block text-sm font-medium text-[var(--foreground)]">
                Name
              </label>
              <input
                id="modal-name"
                type="text"
                autoComplete="name"
                className="input-field mt-1.5"
                placeholder="Jane Doe"
                {...signupForm.register('name')}
              />
              {signupForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {signupForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="modal-signup-email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="modal-signup-email"
                type="email"
                autoComplete="email"
                className="input-field mt-1.5"
                placeholder="you@example.com"
                {...signupForm.register('email')}
              />
              {signupForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="modal-signup-password" className="block text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <input
                id="modal-signup-password"
                type="password"
                autoComplete="new-password"
                className="input-field mt-1.5"
                placeholder="••••••••"
                {...signupForm.register('password')}
              />
              {signupForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Min 8 characters, one uppercase, one lowercase, one number.
              </p>
            </div>
            <button
              type="submit"
              disabled={signupForm.formState.isSubmitting}
              className="btn-primary w-full"
            >
              {signupForm.formState.isSubmitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { closeSignup?.(); openLogin?.(); }}
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </Modal>
    </>
  );
}
