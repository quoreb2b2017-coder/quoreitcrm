import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Call } from '../models/Call.js';
import { User } from '../models/User.js';
import { canRecruiterAccessCandidate } from '../utils/recruiterAccess.js';
import type { ICall } from '../models/Call.js';
import type { CreateCallInput, UpdateCallInput } from '../validations/activitySchemas.js';
import { createCalendarEventWithMeet } from '../services/googleCalendar.js';
import { Candidate } from '../models/Candidate.js';

async function pushActivity(candidateId: string, type: string, description: string) {
  await Candidate.findByIdAndUpdate(candidateId, {
    $push: { activities: { type, description, date: new Date() } },
  });
}

async function canAccessCandidate(userId: string, userRole: string, candidateId: string): Promise<boolean> {
  if (userRole === 'admin') return true;
  if (userRole === 'recruiter') {
    const candidate = await Candidate.findById(candidateId).select('recruiterId').lean();
    if (candidate && candidate.recruiterId.toString() === userId) return true;
    return canRecruiterAccessCandidate(candidateId, userId);
  }
  return false;
}

function toCallResponse(call: ICall & { createdAt: Date; updatedAt: Date }, recruiterName?: string) {
  const candAny = (call as any).candidateId as any;
  const recAny = (call as any).recruiterId as any;
  const candidateId =
    candAny && typeof candAny === 'object' && '_id' in candAny ? String(candAny._id) : String(call.candidateId);
  const recruiterId =
    recAny && typeof recAny === 'object' && '_id' in recAny ? String(recAny._id) : String(call.recruiterId);

  return {
    id: call._id.toString(),
    candidateId,
    recruiterId,
    type: call.type,
    duration: call.duration,
    outcome: call.outcome,
    notes: call.notes ?? '',
    addToCalendar: call.addToCalendar ?? false,
    createMeetLink: call.createMeetLink ?? false,
    startAt: call.startAt ? call.startAt.toISOString() : undefined,
    endAt: call.endAt ? call.endAt.toISOString() : undefined,
    meetLink: call.meetLink ?? undefined,
    createdAt: call.createdAt.toISOString(),
    updatedAt: call.updatedAt.toISOString(),
    recruiterName: recruiterName ?? undefined,
  };
}

export const getByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.candidateId;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');
  if (!(await canAccessCandidate(userId, role, candidateId))) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const calls = await Call.find({ candidateId: new mongoose.Types.ObjectId(candidateId) })
    .sort({ createdAt: -1 })
    .populate('recruiterId', 'name')
    .lean();

  const list = calls.map((c) => {
    const rec = c.recruiterId as unknown as { name: string } | null;
    return toCallResponse(c as ICall & { createdAt: Date; updatedAt: Date }, rec?.name);
  });

  res.json({ success: true, data: list });
});

export const listScheduled = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  const filter: Record<string, unknown> = {
    startAt: { $ne: null },
  };
  if (role === 'recruiter') {
    filter.recruiterId = new mongoose.Types.ObjectId(userId);
  }

  const calls = await Call.find(filter)
    .sort({ startAt: -1 })
    .populate('candidateId', 'name email')
    .populate('recruiterId', 'name')
    .lean();

  const items = calls.map((c) => {
    const cand = c.candidateId as unknown as { _id?: mongoose.Types.ObjectId; name?: string; email?: string } | null;
    const rec = c.recruiterId as unknown as { name?: string } | null;
    return {
      ...toCallResponse(c as ICall & { createdAt: Date; updatedAt: Date }, rec?.name),
      candidate: cand
        ? { id: cand._id?.toString() ?? '', name: cand.name ?? '', email: cand.email ?? '' }
        : null,
    };
  });

  res.json({ success: true, data: items });
});

export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateCallInput;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');
  if (!(await canAccessCandidate(userId, role, body.candidateId))) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const wantsGoogle = !!(body.addToCalendar || body.createMeetLink);
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const endAt = body.endAt ? new Date(body.endAt) : null;

  const userForGoogle = wantsGoogle
    ? await User.findById(userId).select('name googleConnected googleEmail +googleRefreshToken').lean()
    : null;

  if (wantsGoogle) {
    const refreshToken = (userForGoogle as any)?.googleRefreshToken as string | undefined;
    if (!refreshToken) {
      throw new AppError(400, 'Google Calendar is not connected. Please connect Google first.');
    }
    if (!startAt || !endAt) {
      throw new AppError(400, 'startAt and endAt are required to add this call to Google Calendar.');
    }
  }

  const candidate = await Candidate.findById(body.candidateId).select('name email').lean();
  const summary = candidate ? `Candidate call: ${candidate.name}` : 'Candidate call';
  const description = candidate?.email ? `Candidate: ${candidate.name} (${candidate.email})` : undefined;

  let meetLink: string | null = null;
  let calendarEventId: string | null = null;
  if (wantsGoogle && startAt && endAt) {
    const refreshToken = (userForGoogle as any).googleRefreshToken as string;
    let created: { meetLink?: string; calendarEventId?: string };
    try {
      created = await createCalendarEventWithMeet({
        refreshToken,
        summary,
        description,
        startAt,
        endAt,
        createMeetLink: !!body.createMeetLink,
      });
    } catch (err) {
      if (
        err instanceof AppError &&
        err.statusCode === 401 &&
        err.message.toLowerCase().includes('google connection expired')
      ) {
        await User.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
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
    meetLink = created.meetLink ?? null;
    calendarEventId = created.calendarEventId ?? null;
  }

  const call = await Call.create({
    candidateId: new mongoose.Types.ObjectId(body.candidateId),
    recruiterId: new mongoose.Types.ObjectId(userId),
    type: body.type,
    duration: body.duration,
    outcome: body.outcome,
    notes: body.notes ?? '',
    addToCalendar: body.addToCalendar ?? false,
    createMeetLink: body.createMeetLink ?? false,
    startAt,
    endAt,
    meetLink,
    calendarEventId,
  });

  const user = await User.findById(userId).select('name').lean();

  const callDesc = `${body.type} call logged — outcome: ${body.outcome ?? 'N/A'}${body.duration ? `, ${body.duration} min` : ''}`;
  pushActivity(body.candidateId, 'call_logged', callDesc).catch(() => {});

  res.status(201).json({
    success: true,
    data: toCallResponse(call as ICall & { createdAt: Date; updatedAt: Date }, user?.name),
  });
});

export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const body = req.body as UpdateCallInput;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  const call = await Call.findById(id);
  if (!call) throw new AppError(404, 'Call not found');

  if (role !== 'admin' && call.recruiterId.toString() !== userId) {
    throw new AppError(403, 'You can only update your own calls');
  }

  if (body.duration !== undefined) call.duration = body.duration;
  if (body.outcome !== undefined) call.outcome = body.outcome;
  if (body.notes !== undefined) call.notes = body.notes;
  if (body.addToCalendar !== undefined) call.addToCalendar = body.addToCalendar;
  if (body.createMeetLink !== undefined) call.createMeetLink = body.createMeetLink;
  if (body.startAt !== undefined) call.startAt = body.startAt ? new Date(body.startAt) : null;
  if (body.endAt !== undefined) call.endAt = body.endAt ? new Date(body.endAt) : null;

  await call.save();

  pushActivity(
    call.candidateId.toString(),
    'call_updated',
    `Call updated — outcome: ${call.outcome ?? 'N/A'}${call.duration ? `, ${call.duration} min` : ''}`
  ).catch(() => {});

  const user = await User.findById(call.recruiterId).select('name').lean();
  res.json({
    success: true,
    data: toCallResponse(call as ICall & { createdAt: Date; updatedAt: Date }, user?.name),
  });
});

export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  if (role !== 'admin') throw new AppError(403, 'Only admins can delete calls');

  const call = await Call.findByIdAndDelete(id);
  if (!call) throw new AppError(404, 'Call not found');

  pushActivity(
    call.candidateId.toString(),
    'call_deleted',
    `Call deleted — ${call.type ?? 'call'}`
  ).catch(() => {});

  res.json({ success: true, data: { message: 'Call deleted' } });
});
