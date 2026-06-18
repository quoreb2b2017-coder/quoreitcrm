const LOCAL_API = 'http://localhost:4000/api/v1';
const LOCAL_ORIGIN = 'http://localhost:4000';

function isLocalBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

/** Full API base including /api/v1 */
export function getApiUrl(): string {
  if (isLocalBrowser()) return LOCAL_API;
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return configured || LOCAL_API;
}

/** Origin for sockets (no /api/v1) */
export function getSocketOrigin(): string {
  if (isLocalBrowser()) return LOCAL_ORIGIN;
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, '');
  }
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (api) return api.replace(/\/api\/v1$/, '');
  return LOCAL_ORIGIN;
}

export function getPublicSiteUrl(): string {
  if (isLocalBrowser()) {
    return process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3002';
  }
  return process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.quoreit.com';
}
