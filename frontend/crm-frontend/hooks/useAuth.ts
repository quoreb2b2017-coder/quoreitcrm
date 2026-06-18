'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { setAccessToken } from '@/lib/tokenStore';
import toast from 'react-hot-toast';
import type { LoginCredentials, RegisterPayload } from '@/types';

const AUTH_ME_KEY = ['auth', 'me'] as const;

/** Fetches session: tries refresh (cookie) first. On 401/network error returns null so we redirect to login without throwing. */
async function fetchSession() {
  try {
    const { data } = await api.auth.refresh();
    if (!data.success || !data.data) {
      setAccessToken(null);
      return null;
    }
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export function useAuthMe() {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: fetchSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.auth.login(credentials);
      if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed');
      return data.data;
    },
    onSuccess: (tokens) => {
      setAccessToken(tokens.accessToken);
      queryClient.setQueryData(AUTH_ME_KEY, tokens.user);
      toast.success('Logged in successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? err.message ?? 'Login failed');
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.auth.register(payload);
      if (!data.success || !data.data) throw new Error(data.message ?? 'Registration failed');
      return data.data;
    },
    onSuccess: (tokens) => {
      setAccessToken(tokens.accessToken);
      queryClient.setQueryData(AUTH_ME_KEY, tokens.user);
      toast.success('Account created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? err.message ?? 'Registration failed');
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSessionAndGoHome = () => {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: AUTH_ME_KEY });
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  };
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: clearSessionAndGoHome,
    // Still leave the app if the logout request fails (network); cookie may clear on next full session check.
    onError: clearSessionAndGoHome,
  });
}