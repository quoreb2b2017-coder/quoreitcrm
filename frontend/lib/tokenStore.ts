/**
 * Access token store — persisted in sessionStorage so page reloads don't lose it.
 * Refresh token lives in httpOnly cookie.
 */

const KEY = 'ats_access_token';

export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem(KEY, token);
  else sessionStorage.removeItem(KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY);
}
