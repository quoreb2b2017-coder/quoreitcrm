import { config } from './index.js';

const isProduction = config.nodeEnv === 'production';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

/** Cross-site (Vercel CRM + Railway API) needs SameSite=None + Secure in production */
export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
};

export const clearCookieOptions = {
  path: '/',
  httpOnly: true,
  secure: cookieOptions.secure,
  sameSite: cookieOptions.sameSite,
};

export const refreshTokenCookieName = REFRESH_TOKEN_COOKIE;
