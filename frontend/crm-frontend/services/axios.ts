import axios, { type AxiosError } from 'axios';
import { getAccessToken, setAccessToken } from '@/lib/tokenStore';
import { getApiUrl } from '@/lib/apiConfig';

export const axiosClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach access token from in-memory store (cookie holds refresh)
// Let browser set Content-Type for FormData (multipart/form-data + boundary)
axiosClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  config.baseURL = getApiUrl();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function notifyRefreshWaiters(token: string | null) {
  refreshWaiters.forEach((fn) => fn(token));
  refreshWaiters = [];
}

async function refreshAccessToken(): Promise<string | null> {
  // refresh token lives in httpOnly cookie
  const res = await axiosClient.get('/auth/refresh');
  const data = (res.data as any);
  const next = data?.data?.accessToken ?? null;
  setAccessToken(next);
  return next;
}

// On 401, try refresh once, then retry request
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const originalRequest: any = error.config;
    const url = String(originalRequest?.url ?? '');

    if (typeof window === 'undefined' || status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Don't attempt refresh loops on auth endpoints; don't wipe token on refresh failure here
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      setAccessToken(null);
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
      if (!token) return Promise.reject(error);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosClient(originalRequest);
    }

    isRefreshing = true;
    try {
      const token = await refreshAccessToken();
      notifyRefreshWaiters(token);
      if (!token) {
        setAccessToken(null);
        return Promise.reject(error);
      }
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosClient(originalRequest);
    } catch (e) {
      notifyRefreshWaiters(null);
      setAccessToken(null);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
