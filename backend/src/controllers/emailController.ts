import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import type { ApiResponse } from '@ats-saas/shared';
import { User } from '../models/User.js';
import { createCalendarEventWithMeet } from '../services/googleCalendar.js';
import { EmailLog } from '../models/EmailLog.js';
import { InboxEmail } from '../models/emailModel.js';
import {
  extractBodyFromMessage,
  getGmailMessageLabels,
  getHeader,
  listMessagesForSync,
  parseParticipantsFromMessage,
  sendMailWithGmail,
} from '../services/gmailService.js';
import { sendEmail } from '../services/emailService.js';
import { config } from '../config/index.js';
import { Candidate } from '../models/Candidate.js';

async function pushActivityToCandidate(userId: string, toEmail: string, description: string) {
  const candidate = await Candidate.findOne({
    email: toEmail.toLowerCase(),
    recruiterId: new mongoose.Types.ObjectId(userId),
  }).select('_id').lean();
  if (candidate) {
    await Candidate.findByIdAndUpdate(candidate._id, {
      $push: { activities: { type: 'email_sent', description, date: new Date() } },
    });
  }
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toIcsUtc(dt: Date) {
  // YYYYMMDDTHHMMSSZ
  return (
    dt.getUTCFullYear() +
    pad2(dt.getUTCMonth() + 1) +
    pad2(dt.getUTCDate()) +
    'T' +
    pad2(dt.getUTCHours()) +
    pad2(dt.getUTCMinutes()) +
    pad2(dt.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcsText(s: string) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function buildIcs(params: {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startAt: Date;
  endAt: Date;
  url?: string;
  organizerEmail?: string;
  organizerName?: string;
}) {
  const dtStamp = toIcsUtc(new Date());
  const dtStart = toIcsUtc(params.startAt);
  const dtEnd = toIcsUtc(params.endAt);

  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID:-//ATS//EmailInvite//EN',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(params.uid)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(params.summary)}`,
    params.description ? `DESCRIPTION:${escapeIcsText(params.description)}` : null,
    params.location ? `LOCATION:${escapeIcsText(params.location)}` : null,
    params.url ? `URL:${escapeIcsText(params.url)}` : null,
    params.organizerEmail
      ? `ORGANIZER;CN=${escapeIcsText(params.organizerName ?? params.organizerEmail)}:mailto:${escapeIcsText(params.organizerEmail)}`
      : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[];

  return lines.join('\r\n');
}

type AttachmentPayload = {
  filename: string;
  contentBase64: string;
  contentType?: string;
};

export const prepareInvite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const { summary, description, location, startAt, endAt, createMeet } = req.body as {
    summary?: string;
    description?: string;
    location?: string;
    startAt?: string;
    endAt?: string;
    createMeet?: boolean;
  };

  if (!summary?.trim()) throw new AppError(400, 'summary is required');
  if (!startAt || !endAt) throw new AppError(400, 'startAt and endAt are required');

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new AppError(400, 'Invalid startAt/endAt');
  if (end <= start) throw new AppError(400, 'endAt must be after startAt');

  let meetLink: string | undefined;
  let calendarEventId: string | undefined;
  if (createMeet) {
    const dbUser = await User.findById(new mongoose.Types.ObjectId(user.userId)).select('+googleRefreshToken googleConnected email name').lean();
    if (!dbUser?.googleConnected || !dbUser.googleRefreshToken) {
      throw new AppError(409, 'Google is not connected. Connect Google to generate a Meet link.');
    }
    let created: { meetLink?: string; calendarEventId?: string };
    try {
      created = await createCalendarEventWithMeet({
        refreshToken: dbUser.googleRefreshToken,
        summary: summary.trim(),
        description,
        startAt: start,
        endAt: end,
        createMeetLink: true,
      });
    } catch (err) {
      if (
        err instanceof AppError &&
        err.statusCode === 401 &&
        err.message.toLowerCase().includes('google connection expired')
      ) {
        await User.updateOne(
          { _id: new mongoose.Types.ObjectId(user.userId) },
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
      }
      throw err;
    }
    meetLink = created.meetLink;
    calendarEventId = created.calendarEventId;
  }

  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@ats`;
  const organizerName = (user as { name?: string }).name;
  const ics = buildIcs({
    uid,
    summary: summary.trim(),
    description: [description, meetLink ? `Join: ${meetLink}` : null].filter(Boolean).join('\n'),
    location,
    startAt: start,
    endAt: end,
    url: meetLink,
    organizerEmail: user.email,
    organizerName,
  });

  res.json({
    success: true,
    data: {
      meetLink,
      calendarEventId,
      icsBase64: Buffer.from(ics, 'utf8').toString('base64'),
      icsFilename: 'invite.ics',
    },
  } satisfies ApiResponse<{ meetLink?: string; calendarEventId?: string; icsBase64: string; icsFilename: string }>);
});

export const sendEmailController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const { to, subject, html, attachments } = req.body as {
    to?: string | string[];
    subject?: string;
    html?: string;
    from?: string;
    attachments?: AttachmentPayload[];
  };

  if (!to || (Array.isArray(to) && to.length === 0)) throw new AppError(400, 'to is required');
  if (!subject?.trim()) throw new AppError(400, 'subject is required');
  if (!html?.trim()) throw new AppError(400, 'html is required');

  const dbUser = await User.findById(new mongoose.Types.ObjectId(user.userId))
    .select('+googleRefreshToken googleEmail gmailConnected')
    .lean();

  const toList = (Array.isArray(to) ? to : [to]).map((x) => String(x).trim()).filter(Boolean);

  if (!dbUser?.gmailConnected || !dbUser.googleRefreshToken || !dbUser.googleEmail) {
    // Fallback to Resend API
    await sendEmail({
      to: toList,
      subject: subject.trim(),
      html,
      from: config.resend.fromEmail,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.contentBase64,
        contentType: a.contentType,
      })),
    });

    await EmailLog.create({
      userId: new mongoose.Types.ObjectId(user.userId),
      from: config.resend.fromEmail ?? 'system',
      to: toList.map((x) => x.toLowerCase()),
      subject: subject.trim(),
      html,
      attachments: attachments?.map((a) => ({ filename: a.filename, contentType: a.contentType })) ?? [],
      gmailMessageId: `resend-${Date.now()}`,
    });

  for (const addr of toList) {
    pushActivityToCandidate(user.userId, addr, `Email sent: ${subject.trim()}`).catch(() => {});
  }

    res.json({
      success: true,
      data: {
        message: 'Email sent via Resend',
        gmailMessageId: 'resend',
      },
    } satisfies ApiResponse<{ message: string; gmailMessageId: string; gmailThreadId?: string }>);
    return;
  }

  const fromAddr = dbUser.googleEmail.trim();

  let gmailResult: { gmailMessageId: string; threadId?: string };
  try {
    gmailResult = await sendMailWithGmail({
      refreshToken: dbUser.googleRefreshToken,
      from: fromAddr,
      to: toList,
      subject: subject.trim(),
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        contentBase64: a.contentBase64,
        contentType: a.contentType,
      })),
    });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 401) {
      await User.updateOne(
        { _id: new mongoose.Types.ObjectId(user.userId) },
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
    }
    throw err;
  }

  await EmailLog.create({
    userId: new mongoose.Types.ObjectId(user.userId),
    from: fromAddr,
    to: toList.map((x) => x.toLowerCase()),
    subject: subject.trim(),
    html,
    attachments: attachments?.map((a) => ({ filename: a.filename, contentType: a.contentType })) ?? [],
    gmailMessageId: gmailResult.gmailMessageId,
    gmailThreadId: gmailResult.threadId,
  });

  for (const addr of toList) {
    pushActivityToCandidate(user.userId, addr, `Email sent: ${subject.trim()}`).catch(() => {});
  }

  res.json({
    success: true,
    data: {
      message: 'Email sent via Gmail',
      gmailMessageId: gmailResult.gmailMessageId,
      gmailThreadId: gmailResult.threadId,
    },
  } satisfies ApiResponse<{ message: string; gmailMessageId: string; gmailThreadId?: string }>);
});

/** Check that a sent mail still exists on Gmail (e.g. in Sent). Does not prove recipient inbox delivery. */
export const gmailSentProofController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const emailLogId = String(req.params.emailLogId ?? '').trim();
  if (!emailLogId || !mongoose.isValidObjectId(emailLogId)) throw new AppError(400, 'Invalid email log id');

  const log = await EmailLog.findOne({
    _id: new mongoose.Types.ObjectId(emailLogId),
    userId: new mongoose.Types.ObjectId(user.userId),
  })
    .select('gmailMessageId')
    .lean();

  if (!log?.gmailMessageId) {
    throw new AppError(404, 'No Gmail message id for this log (older sends may not have one).');
  }

  if (String(log.gmailMessageId).startsWith('resend')) {
    res.json({
      success: true,
      data: {
        gmailMessageId: log.gmailMessageId,
        onGmail: false,
        hasSentLabel: true,
        labelIds: [],
        note: 'Sent via Resend system fallback.',
      },
    });
    return;
  }

  const dbUser = await User.findById(new mongoose.Types.ObjectId(user.userId))
    .select('+googleRefreshToken gmailConnected')
    .lean();

  if (!dbUser?.googleRefreshToken || !dbUser.gmailConnected) {
    res.json({
      success: true,
      data: {
        gmailMessageId: log.gmailMessageId,
        onGmail: false,
        hasSentLabel: false,
        labelIds: [],
        note: 'Gmail is disconnected.',
      },
    });
    return;
  }

  const { labelIds } = await getGmailMessageLabels({
    refreshToken: dbUser.googleRefreshToken,
    gmailMessageId: log.gmailMessageId,
  });

  const hasSent = labelIds.includes('SENT');

  res.json({
    success: true,
    data: {
      gmailMessageId: log.gmailMessageId,
      onGmail: true,
      hasSentLabel: hasSent,
      labelIds,
      note:
        'This confirms the message exists in your connected Gmail. Recipient inbox/spam is controlled by their mail server.',
    },
  });
});

export const syncInboxController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const dbUser = await User.findById(new mongoose.Types.ObjectId(user.userId))
    .select('+googleRefreshToken googleEmail gmailConnected')
    .lean();

  if (!dbUser?.gmailConnected || !dbUser.googleRefreshToken || !dbUser.googleEmail) {
    res.json({ success: true, data: { synced: 0, note: 'Gmail disconnected. Nothing synced.' } });
    return;
  }

  const maxResults = Math.min(50, Math.max(5, Number((req.body as { maxResults?: number })?.maxResults ?? 25)));
  const q =
    typeof (req.body as { query?: string })?.query === 'string' && (req.body as { query: string }).query.trim()
      ? (req.body as { query: string }).query.trim()
      : 'in:inbox newer_than:90d';

  let messages;
  try {
    messages = await listMessagesForSync({
      refreshToken: dbUser.googleRefreshToken,
      maxResults,
      query: q,
    });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 401) {
      await User.updateOne(
        { _id: dbUser._id },
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
    }
    throw err;
  }

  const uid = new mongoose.Types.ObjectId(user.userId);
  let synced = 0;

  for (const m of messages) {
    if (!m.id || !m.threadId) continue;
    const participants = parseParticipantsFromMessage(m, dbUser.googleEmail);
    const subject = getHeader(m, 'Subject');
    const body = extractBodyFromMessage(m);
    const internalDate = m.internalDate ? new Date(Number(m.internalDate)) : new Date();
    const labels = m.labelIds ?? [];
    const isUnread = labels.includes('UNREAD');

    await InboxEmail.findOneAndUpdate(
      { userId: uid, gmailMessageId: m.id },
      {
        userId: uid,
        gmailMessageId: m.id,
        threadId: m.threadId,
        sender: participants.from,
        receiver: participants.to,
        subject,
        message: body,
        snippet: m.snippet ?? '',
        isRead: !isUnread,
        internalDate,
      },
      { upsert: true, new: true }
    );
    synced += 1;
  }

  res.json({
    success: true,
    data: { synced },
  } satisfies ApiResponse<{ synced: number }>);
});

export const listInboxThreadsController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const limit = Math.min(80, Math.max(1, Number(req.query.limit ?? 40)));
  const uid = new mongoose.Types.ObjectId(user.userId);

  const threads = await InboxEmail.aggregate([
    { $match: { userId: uid } },
    { $sort: { internalDate: -1 } },
    {
      $group: {
        _id: '$threadId',
        lastAt: { $first: '$internalDate' },
        preview: { $first: '$snippet' },
        subject: { $first: '$subject' },
        sender: { $first: '$sender' },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { lastAt: -1 } },
    { $limit: limit },
  ]);

  res.json({
    success: true,
    data: {
      items: threads.map((t) => ({
        threadId: String(t._id),
        subject: t.subject ?? '',
        snippet: t.preview ?? '',
        lastMessageAt: t.lastAt,
        messageCount: t.count,
        unreadCount: t.unread,
        lastSender: t.sender ?? '',
      })),
    },
  } satisfies ApiResponse<{ items: unknown[] }>);
});

export const getInboxThreadController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const threadId = String(req.params.threadId ?? '').trim();
  if (!threadId) throw new AppError(400, 'threadId is required');

  const uid = new mongoose.Types.ObjectId(user.userId);
  const items = await InboxEmail.find({ userId: uid, threadId })
    .sort({ internalDate: 1 })
    .lean();

  res.json({
    success: true,
    data: {
      threadId,
      messages: items.map((e) => ({
        id: String(e._id),
        gmailMessageId: e.gmailMessageId,
        sender: e.sender,
        receiver: e.receiver,
        subject: e.subject,
        message: e.message,
        snippet: e.snippet,
        isRead: e.isRead,
        internalDate: e.internalDate,
      })),
    },
  } satisfies ApiResponse<{ threadId: string; messages: unknown[] }>);
});

export const listSentEmails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required');

  const candidateEmail = String(req.query.candidateEmail ?? '').trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
  if (!candidateEmail) throw new AppError(400, 'candidateEmail is required');

  const items = await EmailLog.find({
    userId: new mongoose.Types.ObjectId(user.userId),
    to: candidateEmail,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((e: any) => ({
        id: String(e._id),
        from: e.from,
        to: e.to,
        subject: e.subject,
        html: e.html,
        attachments: e.attachments ?? [],
        createdAt: e.createdAt,
        gmailMessageId: e.gmailMessageId ?? undefined,
        gmailThreadId: e.gmailThreadId ?? undefined,
      })),
    },
  } satisfies ApiResponse<{ items: any[] }>);
});

