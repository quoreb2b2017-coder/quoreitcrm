/** Safe in-app path after login/signup (open redirects blocked). */
export function safeAuthRedirect(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (raw == null || raw === '') return fallback;
  let path: string;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return fallback;
  }
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  const lower = path.toLowerCase();
  if (lower.startsWith('/login') || lower.startsWith('/signup')) return fallback;
  return path;
}
