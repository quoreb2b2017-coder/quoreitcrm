import { config } from './index.js';

const isProduction = config.nodeEnv === 'production';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export const refreshTokenCookieName = REFRESH_TOKEN_COOKIE;
