'use client';

import { createContext, useCallback, useContext } from 'react';
import { useAuthMe, useLogin, useRegister, useLogout } from '@/hooks/useAuth';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ReturnType<typeof useLogin>['mutateAsync'];
  register: ReturnType<typeof useRegister>['mutateAsync'];
  logout: () => Promise<void>;
  hasRole: (...roles: User['role'][]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuthMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const hasRole = useCallback(
    (...roles: User['role'][]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value: AuthContextValue = {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
