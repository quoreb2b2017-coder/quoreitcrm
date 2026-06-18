import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import { cookieOptions, clearCookieOptions, refreshTokenCookieName } from '../config/cookies.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import type { AuthTokens, User as SharedUser } from '@ats-saas/shared';
import type { LoginInput, RegisterInput } from '../validations/authSchemas.js';
import { buildGoogleAuthUrl, getGoogleOAuthClient } from '../services/googleCalendar.js';
import crypto from 'crypto';
import { google } from 'googleapis';

function toUserResponse(user: {
  _id: { toString: () => string };
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phoneNumbers?: string[];
  phoneConnected?: boolean;
  googleConnected?: boolean;
  googleEmail?: string;
  gmailConnected?: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SharedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as SharedUser['role'],
    avatar: user.avatar,
    phoneNumbers: user.phoneNumbers,
    phoneConnected: user.phoneConnected,
    googleConnected: user.googleConnected,
    googleEmail: user.googleEmail,
    gmailConnected: user.gmailConnected,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function signAccessToken(
  userId: string,
  email: string,
  role: string,
  name?: string
): { accessToken: string; expiresIn: number } {
  const expiresIn = 15 * 60; // 15 minutes in seconds
  const accessToken = jwt.sign(
    { userId, email, role, name },
    config.jwt.secret,
    { expiresIn }
  );
  return { accessToken, expiresIn };
}

function signRefreshToken(userId: string): string {
  // 30 days in seconds (jsonwebtoken SignOptions expects number for expiresIn in strict types)
  const refreshExpiresSeconds = 30 * 24 * 60 * 60;
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: refreshExpiresSeconds }
  );
}

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as RegisterInput;
  const { email, password, name, role } = body;

  const existing = await User.findOne({ email }).select('_id');
  if (existing) {
    throw new AppError(409, 'User with this email already exists');
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password: hashed,
    name,
    role: role ?? 'recruiter',
  });

  const { accessToken, expiresIn } = signAccessToken(user._id.toString(), user.email, user.role, user.name);
  const refreshToken = signRefreshToken(user._id.toString());

  res.cookie(refreshTokenCookieName, refreshToken, cookieOptions);
  await sendWelcomeEmail(user.email, user.name).catch(() => { });

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      expiresIn,
      user: toUserResponse(user),
    } satisfies AuthTokens,
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as LoginInput;
  const { email, password } = body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }
  if (user.role !== 'admin' && user.role !== 'recruiter') {
    throw new AppError(403, 'This account role is no longer supported. Only Admin and Recruiter can sign in.');
  }

  const { accessToken, expiresIn } = signAccessToken(user._id.toString(), user.email, user.role, user.name);
  const refreshToken = signRefreshToken(user._id.toString());

  res.cookie(refreshTokenCookieName, refreshToken, cookieOptions);

  res.json({
    success: true,
    data: {
      accessToken,
      expiresIn,
      user: toUserResponse(user),
    } satisfies AuthTokens,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[refreshTokenCookieName];
  if (!token) {
    throw new AppError(401, 'Refresh token missing');
  }

  let decoded: { userId?: string; type?: string };
  try {
    decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };
  } catch {
    res.clearCookie(refreshTokenCookieName, clearCookieOptions);
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  if (decoded.type !== 'refresh' || !decoded.userId) {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    res.clearCookie(refreshTokenCookieName, clearCookieOptions);
    throw new AppError(401, 'User no longer exists');
  }
  if (user.role !== 'admin' && user.role !== 'recruiter') {
    res.clearCookie(refreshTokenCookieName, clearCookieOptions);
    throw new AppError(403, 'This account role is no longer supported.');
  }

  const { accessToken, expiresIn } = signAccessToken(user._id.toString(), user.email, user.role, user.name);
  const newRefreshToken = signRefreshToken(user._id.toString());
  res.cookie(refreshTokenCookieName, newRefreshToken, cookieOptions);

  res.json({
    success: true,
    data: {
      accessToken,
      expiresIn,
      user: toUserResponse(user),
    } satisfies AuthTokens,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(refreshTokenCookieName, clearCookieOptions);
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, 'Not authenticated');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.role !== 'admin' && user.role !== 'recruiter') {
    throw new AppError(403, 'This account role is no longer supported.');
  }

  res.json({
    success: true,
    data: toUserResponse(user),
  });
});

function safeOAuthReturnTo(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return undefined;
  return raw;
}

export const googleAuthUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.userId) throw new AppError(401, 'Not authenticated');
  const returnTo = safeOAuthReturnTo(req.query.returnTo);
  // short-lived state token to identify the user in callback
  const state = jwt.sign(
    { userId: req.user.userId, nonce: crypto.randomUUID(), type: 'google_oauth', returnTo },
    config.jwt.secret,
    { expiresIn: 10 * 60 }
  );
  const url = buildGoogleAuthUrl(state);
  res.json({ success: true, data: { url } });
});

export const googleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');
  if (!code || !state) throw new AppError(400, 'Missing code/state');

  let decoded: { userId?: string; type?: string; returnTo?: string };
  try {
    decoded = jwt.verify(state, config.jwt.secret) as { userId?: string; type?: string; returnTo?: string };
  } catch {
    throw new AppError(401, 'Invalid oauth state');
  }
  if (decoded.type !== 'google_oauth' || !decoded.userId) throw new AppError(401, 'Invalid oauth state');

  const oauth2 = getGoogleOAuthClient();
  const { tokens } = await oauth2.getToken(code);

  const user = await User.findById(decoded.userId).select('+googleRefreshToken');
  if (!user) throw new AppError(404, 'User not found');

  const returnPath = safeOAuthReturnTo(decoded.returnTo) ?? '/dashboard/activity';

  const unsetGoogle = {
    googleRefreshToken: 1,
    googleEmail: 1,
    googleAccessToken: 1,
    googleAccessTokenExpiresAt: 1,
  } as const;

  // Ensure the returned token includes Calendar scope. If not, don't save it.
  try {
    if (tokens.access_token) {
      const info = await oauth2.getTokenInfo(tokens.access_token);
      const scopeRaw = (info as { scope?: string; scopes?: string | string[] }).scope ?? (info as { scopes?: string | string[] }).scopes;
      const scopeArray = Array.isArray(scopeRaw)
        ? scopeRaw
        : typeof scopeRaw === 'string'
          ? scopeRaw.split(/\s+/).filter(Boolean)
          : [];
      const scopes = new Set(scopeArray.map((s) => s.toLowerCase()));
      const hasCalendar =
        scopes.has('https://www.googleapis.com/auth/calendar') ||
        scopes.has('https://www.googleapis.com/auth/calendar.events');
      if (!hasCalendar) {
        await User.updateOne(
          { _id: user._id },
          { $unset: unsetGoogle, $set: { googleConnected: false, gmailConnected: false } }
        );
        const redirect = `${config.frontend.url}${returnPath}?google=scope_missing`;
        res.redirect(302, redirect);
        return;
      }

      const hasGmailSend = scopes.has('https://www.googleapis.com/auth/gmail.send');
      const hasGmailRead = scopes.has('https://www.googleapis.com/auth/gmail.readonly');
      (user as { gmailConnected?: boolean }).gmailConnected = !!(hasGmailSend && hasGmailRead);
    }
  } catch {
    // If tokeninfo fails, continue; APIs will give clearer errors later.
  }

  if (tokens.refresh_token) {
    (user as { googleRefreshToken?: string }).googleRefreshToken = tokens.refresh_token;
  }
  user.googleConnected = !!(user as { googleRefreshToken?: string }).googleRefreshToken;

  if (tokens.access_token) {
    (user as { googleAccessToken?: string }).googleAccessToken = tokens.access_token;
  }
  if (tokens.expiry_date) {
    (user as { googleAccessTokenExpiresAt?: Date }).googleAccessTokenExpiresAt = new Date(tokens.expiry_date);
  }

  // best-effort email fetch
  try {
    oauth2.setCredentials(tokens);
    const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
    const info = await oauth2Api.userinfo.get();
    const email = info.data.email ?? undefined;
    if (email) (user as { googleEmail?: string }).googleEmail = email;
  } catch {
    // ignore
  }

  await user.save();

  const redirect = `${config.frontend.url}${returnPath}?google=connected`;
  res.redirect(302, redirect);
});

export const logoutGoogle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.userId) throw new AppError(401, 'Not authenticated');
  const user = await User.findById(req.user.userId).select('+googleRefreshToken');
  if (!user) throw new AppError(404, 'User not found');

  const refreshToken = (user as any).googleRefreshToken as string | undefined;
  if (refreshToken) {
    // Best-effort revoke so Google issues a fresh token next time.
    try {
      const oauth2 = getGoogleOAuthClient();
      await oauth2.revokeToken(refreshToken);
    } catch {
      // ignore revoke failures
    }
  }

  await User.updateOne(
    { _id: user._id },
    {
      $unset: {
        googleRefreshToken: 1,
        googleEmail: 1,
        googleAccessToken: 1,
        googleAccessTokenExpiresAt: 1,
      },
      $set: { googleConnected: false, gmailConnected: false },
    }
  );
  res.json({ success: true, data: { message: 'Google disconnected' } });
});
