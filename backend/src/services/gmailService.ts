import crypto from 'crypto';
import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';
import { getGoogleOAuthClient } from './googleCalendar.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

export const GMAIL_SCOPES = {
  send: 'https://www.googleapis.com/auth/gmail.send',
  readonly: 'https://www.googleapis.com/auth/gmail.readonly',
} as const;

function encodeSubject(subject: string): string {
  // If the subject is mostly ASCII, do not B-encode it. This avoids
  // unnecessary base64 strings which can look like spam or exceed 75 chars.
  if (/^[\x00-\x7F]*$/.test(subject)) {
    return subject;
  }
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

/** RFC 2822 Date header (required by many MTAs for reliable delivery). */
function rfc2822DateHeader(d = new Date()): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  const dayName = days[d.getUTCDay()];
  const mon = months[d.getUTCMonth()];
  const day = pad(d.getUTCDate());
  const year = d.getUTCFullYear();
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return `${dayName}, ${day} ${mon} ${year} ${time} +0000`;
}

/** RFC 2045: base64 body lines should be ≤76 chars for strict MIME parsers. */
function foldBase64(b64: string): string {
  const clean = b64.replace(/\s/g, '');
  const lines: string[] = [];
  for (let i = 0; i < clean.length; i += 76) {
    lines.push(clean.slice(i, i + 76));
  }
  return lines.join('\r\n');
}

function htmlToPlainFallback(html: string): string {
  const t = String(html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t || '(message)';
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Build RFC 822 message: FROM is the connected Gmail account. */
export function buildRfc822Message(params: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  attachments?: { filename: string; contentBase64: string; contentType?: string }[];
}): string {
  const from = params.from.trim();
  const formattedFrom = from.includes('<') ? from : `<${from}>`;

  const to = params.to.map((t) => t.trim()).filter(Boolean);
  if (!from || to.length === 0) throw new AppError(400, 'Invalid from/to for email');

  const formattedTo = to.map((t) => (t.includes('<') ? t : `<${t}>`));

  const subject = encodeSubject(params.subject);
  const attachments = params.attachments?.filter((a) => a.filename && a.contentBase64) ?? [];
  const dateHdr = rfc2822DateHeader();

  if (attachments.length === 0) {
    // multipart/alternative: plain + html (better deliverability than HTML-only raw 8-bit)
    const altB = `alt_${crypto.randomBytes(12).toString('hex')}`;
    const plainB64 = foldBase64(Buffer.from(htmlToPlainFallback(params.html), 'utf8').toString('base64'));
    const htmlB64 = foldBase64(Buffer.from(params.html, 'utf8').toString('base64'));
    return [
      'MIME-Version: 1.0',
      `Date: ${dateHdr}`,
      `From: ${formattedFrom}`,
      `To: ${formattedTo.join(', ')}`,
      `Subject: ${subject}`,
      `Content-Type: multipart/alternative; boundary="${altB}"`,
      '',
      `--${altB}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      plainB64,
      '',
      `--${altB}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      htmlB64,
      '',
      `--${altB}--`,
      '',
    ].join('\r\n');
  }

  const boundary = `mixed_${crypto.randomBytes(16).toString('hex')}`;
  const htmlB64 = foldBase64(Buffer.from(params.html, 'utf8').toString('base64'));

  const lines: string[] = [
    'MIME-Version: 1.0',
    `Date: ${dateHdr}`,
    `From: ${formattedFrom}`,
    `To: ${formattedTo.join(', ')}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    htmlB64,
  ];

  for (const att of attachments) {
    const ctype = att.contentType?.trim() || 'application/octet-stream';
    lines.push(
      `--${boundary}`,
      `Content-Type: ${ctype}; name="${att.filename.replace(/"/g, '')}"`,
      `Content-Disposition: attachment; filename="${att.filename.replace(/"/g, '')}"`,
      'Content-Transfer-Encoding: base64',
      '',
      foldBase64(att.contentBase64.replace(/\s/g, ''))
    );
  }
  lines.push(`--${boundary}--`, '');
  return lines.join('\r\n');
}

export function rfc822ToGmailRaw(rfc822: string): string {
  return toBase64Url(Buffer.from(rfc822, 'utf8'));
}

function mapGoogleError(err: unknown): never {
  const e = err as {
    response?: { status?: number; data?: { error?: { message?: string } } };
    errors?: { reason?: string }[];
    message?: string;
  };
  const status = e?.response?.status;
  const reason = e?.errors?.[0]?.reason;
  const message = e?.response?.data?.error?.message ?? e?.message ?? 'Gmail API error';

  if (config.nodeEnv !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[Gmail]', { status, reason, message });
  }

  if (reason === 'invalid_grant' || (status === 400 && String(message).toLowerCase().includes('invalid_grant'))) {
    throw new AppError(401, 'Google connection expired. Disconnect Google and connect again, then retry.');
  }
  if (status === 401) {
    throw new AppError(401, 'Google connection expired. Disconnect Google and connect again, then retry.');
  }
  if (status === 403) {
    throw new AppError(403, `Gmail permission error: ${message}`);
  }
  throw new AppError(502, `Gmail error: ${message}`);
}

export async function sendMailWithGmail(params: {
  refreshToken: string;
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; contentBase64: string; contentType?: string }[];
}): Promise<{ gmailMessageId: string; threadId?: string }> {
  const oauth2 = getGoogleOAuthClient();
  oauth2.setCredentials({ refresh_token: params.refreshToken });
  try {
    await oauth2.getAccessToken();
  } catch (err) {
    mapGoogleError(err);
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const toList = Array.isArray(params.to) ? params.to : [params.to];
  const raw = rfc822ToGmailRaw(
    buildRfc822Message({
      from: params.from,
      to: toList,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    })
  );

  let sent;
  try {
    sent = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
  } catch (err) {
    mapGoogleError(err);
  }

  const gmailMessageId = sent?.data?.id;
  if (!gmailMessageId) {
    throw new AppError(502, 'Gmail did not return a message id — send may have failed. Check Gmail API logs and reconnect Google.');
  }

  return {
    gmailMessageId,
    threadId: sent?.data?.threadId ?? undefined,
  };
}

/** Confirms the message still exists in the connected mailbox (e.g. under Sent). */
export async function getGmailMessageLabels(params: {
  refreshToken: string;
  gmailMessageId: string;
}): Promise<{ labelIds: string[] }> {
  const oauth2 = getGoogleOAuthClient();
  oauth2.setCredentials({ refresh_token: params.refreshToken });
  try {
    await oauth2.getAccessToken();
  } catch (err) {
    mapGoogleError(err);
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  let res;
  try {
    res = await gmail.users.messages.get({
      userId: 'me',
      id: params.gmailMessageId,
      format: 'minimal',
    });
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      throw new AppError(404, 'This message was not found on Gmail (it may have been deleted).');
    }
    mapGoogleError(err);
  }

  const labelIds = res?.data?.labelIds ?? [];
  return { labelIds };
}

function decodeBody(data: string | null | undefined): string {
  if (!data) return '';
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf8');
}

function walkParts(
  part: gmail_v1.Schema$MessagePart | undefined,
  out: { html?: string; text?: string }
): void {
  if (!part) return;
  const mt = part.mimeType ?? '';
  if (mt === 'text/html' && part.body?.data) {
    out.html = decodeBody(part.body.data);
  } else if (mt === 'text/plain' && part.body?.data && !out.html) {
    out.text = decodeBody(part.body.data);
  }
  if (part.parts) {
    for (const p of part.parts) walkParts(p, out);
  }
}

export function extractBodyFromMessage(msg: gmail_v1.Schema$Message): string {
  const out: { html?: string; text?: string } = {};
  if (msg.payload) walkParts(msg.payload, out);
  return (out.html ?? out.text ?? msg.snippet ?? '').trim();
}

export function getHeader(
  msg: gmail_v1.Schema$Message,
  name: string
): string {
  const headers = msg.payload?.headers ?? [];
  return headers.find((h) => (h.name ?? '').toLowerCase() === name.toLowerCase())?.value ?? '';
}

export function parseParticipantsFromMessage(
  msg: gmail_v1.Schema$Message,
  myEmail: string
): { from: string; to: string[] } {
  const get = (n: string) => getHeader(msg, n);

  const from = get('From') || myEmail;
  const toRaw = get('To');
  const ccRaw = get('Cc');
  const parseEmails = (s: string) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  return {
    from,
    to: [...parseEmails(toRaw), ...parseEmails(ccRaw)].filter(Boolean),
  };
}

export async function listMessagesForSync(params: {
  refreshToken: string;
  maxResults?: number;
  query?: string;
}): Promise<gmail_v1.Schema$Message[]> {
  const oauth2 = getGoogleOAuthClient();
  oauth2.setCredentials({ refresh_token: params.refreshToken });
  try {
    await oauth2.getAccessToken();
  } catch (err) {
    mapGoogleError(err);
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const maxResults = Math.min(100, Math.max(1, params.maxResults ?? 30));
  const q = params.query ?? 'in:inbox';

  let listRes: { data?: gmail_v1.Schema$ListMessagesResponse } | undefined;
  try {
    listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q,
    });
  } catch (err) {
    mapGoogleError(err);
  }

  const refs = listRes?.data?.messages ?? [];
  const out: gmail_v1.Schema$Message[] = [];

  for (const ref of refs) {
    if (!ref.id) continue;
    try {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: ref.id,
        format: 'full',
      });
      if (full.data) out.push(full.data);
    } catch (err) {
      if (config.nodeEnv !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[Gmail] skip message', ref.id, err);
      }
    }
  }

  return out;
}
