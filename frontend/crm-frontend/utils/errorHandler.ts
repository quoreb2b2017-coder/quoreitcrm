import type { AxiosError } from 'axios';

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosErr = error as AxiosError<ApiErrorBody>;
    const data = axiosErr.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      return Array.isArray(first) ? first[0] ?? 'Validation error' : 'Validation error';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getValidationErrors(error: unknown): Record<string, string> {
  const axiosErr = error as AxiosError<ApiErrorBody>;
  const data = axiosErr.response?.data?.errors;
  if (!data) return {};
  const out: Record<string, string> = {};
  for (const [key, arr] of Object.entries(data)) {
    out[key] = Array.isArray(arr) ? arr[0] ?? '' : '';
  }
  return out;
}
