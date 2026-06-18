/**
 * Access token — persisted in localStorage so page reload keeps the session.
 * Refresh token lives in httpOnly cookie on the API domain.
 */

const KEY = 'ats_access_token';

export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}
