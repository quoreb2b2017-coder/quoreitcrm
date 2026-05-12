import { google } from 'googleapis';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

export function getGoogleOAuthClient() {
  const { clientId, clientSecret, redirectUri } = config.google;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError(503, 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildGoogleAuthUrl(state: string) {
  const oauth2 = getGoogleOAuthClient();
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    // Force account picker + consent so Google issues a fresh refresh token.
    prompt: 'consent select_account',
    // Force requesting the exact scopes we need. This helps when old tokens had fewer scopes.
    include_granted_scopes: false,
    scope: [
      // Calendar scope ensures we can create events + conference (Meet) data.
      'https://www.googleapis.com/auth/calendar',
      // Some Google setups behave better with the narrower events scope present too.
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      // Gmail: send from the recruiter's mailbox + read inbox for ATS mirror.
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
    state,
  });
}

export async function createCalendarEventWithMeet(params: {
  refreshToken: string;
  summary: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  createMeetLink: boolean;
}) {
  const oauth2 = getGoogleOAuthClient();
  oauth2.setCredentials({ refresh_token: params.refreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2 });
  const requestId = crypto.randomUUID();

  let event;
  try {
    event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: params.createMeetLink ? 1 : 0,
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startAt.toISOString() },
        end: { dateTime: params.endAt.toISOString() },
        ...(params.createMeetLink
          ? {
            conferenceData: {
              createRequest: {
                requestId,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          }
          : {}),
      },
    });
  } catch (err: any) {
    const status = err?.response?.status as number | undefined;
    const reason =
      err?.response?.data?.error?.errors?.[0]?.reason ??
      err?.errors?.[0]?.reason ??
      undefined;
    const message =
      err?.response?.data?.error?.message ??
      err?.message ??
      'Google Calendar request failed';

    // Help debugging in dev logs
    if (config.nodeEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[GoogleCalendar]', { status, reason, message });
    }

    // Common Google auth failures:
    // - 403: insufficient scopes / forbidden
    // - 401/400: invalid_grant / invalid credentials (Google often returns 400 for invalid_grant)
    if (reason === 'invalid_grant' || (status === 400 && String(message).toLowerCase().includes('invalid_grant'))) {
      throw new AppError(
        401,
        'Google connection expired. Please disconnect Google and connect again, then retry.'
      );
    }
    if (status === 403) {
      if (reason === 'accessNotConfigured') {
        throw new AppError(
          403,
          'Google Calendar API is not enabled for this Google Cloud project. Enable "Google Calendar API" in APIs & Services, then reconnect Google and retry.'
        );
      }
      if (reason === 'insufficientPermissions' || reason === 'forbidden') {
        throw new AppError(
          403,
          'Google permission missing. Please disconnect Google and connect again, then retry.'
        );
      }
      throw new AppError(
        403,
        `Google request forbidden (${reason ?? 'unknown'}): ${message}`
      );
    }
    if (status === 401) {
      throw new AppError(
        401,
        'Google connection expired. Please disconnect Google and connect again, then retry.'
      );
    }

    throw new AppError(502, `Google Calendar error: ${message}`);
  }

  const meetLink =
    event.data.hangoutLink ??
    event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ??
    undefined;

  return {
    calendarEventId: event.data.id ?? undefined,
    meetLink,
  };
}

