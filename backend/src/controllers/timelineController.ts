import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Note } from '../models/Note.js';
import { Call } from '../models/Call.js';
import { canRecruiterAccessCandidate } from '../utils/recruiterAccess.js';

import { Candidate } from '../models/Candidate.js';
import { EmailLog } from '../models/EmailLog.js';

async function canAccessCandidate(userId: string, userRole: string, candidateId: string): Promise<boolean> {
  if (userRole === 'admin') return true;
  if (userRole === 'recruiter') {
    const candidate = await Candidate.findById(candidateId).select('recruiterId').lean();
    if (candidate && candidate.recruiterId.toString() === userId) return true;
    return canRecruiterAccessCandidate(candidateId, userId);
  }
  return false;
}

/** GET unified timeline: notes, calls, system activities, internal notes, sent emails */
export const getByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.candidateId;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');
  if (!(await canAccessCandidate(userId, role, candidateId))) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const cid = new mongoose.Types.ObjectId(candidateId);
  const [notes, calls, candidateDoc] = await Promise.all([
    Note.find({ candidateId: cid })
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('recruiterId', 'name')
      .populate('tags')
      .lean(),
    Call.find({ candidateId: cid }).sort({ createdAt: -1 }).populate('recruiterId', 'name').lean(),
    Candidate.findById(cid).select('activities recruiterId internalNotes email').populate('recruiterId', 'name').lean(),
  ]);

  const tagMap = new Map<string, { name: string; color: string }>();
  const items: Array<{
    type: 'note' | 'call';
    id: string;
    createdAt: string;
    isPinned?: boolean;
    title?: string;
    description?: string;
    tags?: Array<{ id: string; name: string; color: string }>;
    recruiterName?: string;
    callType?: string;
    duration?: number;
    outcome?: string;
    notes?: string;
  }> = [];

  for (const n of notes) {
    const rec = n.recruiterId as unknown as { name: string } | null;
    const tagRefs = (n.tags ?? []) as unknown as Array<{ _id?: mongoose.Types.ObjectId; name?: string; color?: string } | mongoose.Types.ObjectId>;
    const tagList = tagRefs
      .filter((t): t is { _id: mongoose.Types.ObjectId; name: string; color: string } => t != null && typeof t === 'object' && 'name' in t)
      .map((t) => {
        const id = t._id.toString();
        if (!tagMap.has(id)) tagMap.set(id, { name: t.name, color: t.color ?? '#6b7280' });
        return { id, name: t.name, color: t.color ?? '#6b7280' };
      });
    items.push({
      type: 'note',
      id: (n as { _id: mongoose.Types.ObjectId })._id.toString(),
      createdAt: (n as { createdAt: Date }).createdAt.toISOString(),
      isPinned: n.isPinned,
      title: n.title,
      description: n.description ?? '',
      tags: tagList,
      recruiterName: rec?.name,
    });
  }

  for (const c of calls) {
    const rec = c.recruiterId as unknown as { name: string } | null;
    items.push({
      type: 'call',
      id: (c as { _id: mongoose.Types.ObjectId })._id.toString(),
      createdAt: (c as { createdAt: Date }).createdAt.toISOString(),
      recruiterName: rec?.name,
      callType: c.type,
      duration: c.duration,
      outcome: c.outcome,
      notes: c.notes ?? '',
    });
  }

  const candidateActivities = Array.isArray((candidateDoc as { activities?: Array<{ type?: string; description?: string; date?: Date | string }> } | null)?.activities)
    ? (candidateDoc as { activities: Array<{ type?: string; description?: string; date?: Date | string }> }).activities
    : [];
  const candidateRecruiterName =
    (candidateDoc as { recruiterId?: { name?: string } | mongoose.Types.ObjectId } | null)?.recruiterId &&
    typeof (candidateDoc as { recruiterId?: { name?: string } | mongoose.Types.ObjectId }).recruiterId === 'object' &&
    'name' in ((candidateDoc as { recruiterId?: { name?: string } | mongoose.Types.ObjectId }).recruiterId as object)
      ? ((candidateDoc as { recruiterId?: { name?: string } }).recruiterId?.name ?? '')
      : '';

  candidateActivities.forEach((a, index) => {
    const rawType = String(a.type ?? 'activity').trim();
    const displayType = rawType
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
    const when = a.date ? new Date(a.date) : new Date();
    items.push({
      type: 'note',
      id: `activity-${candidateId}-${index}-${when.getTime()}`,
      createdAt: when.toISOString(),
      title: displayType,
      description: String(a.description ?? '').trim(),
      recruiterName: candidateRecruiterName || 'System',
    });
  });

  const internalNotes = Array.isArray(
    (candidateDoc as { internalNotes?: Array<{ id: number; text: string; date?: string; createdAt?: number }> } | null)?.internalNotes
  )
    ? (candidateDoc as { internalNotes: Array<{ id: number; text: string; date?: string; createdAt?: number }> }).internalNotes
    : [];
  internalNotes.forEach((n) => {
    const when =
      n.createdAt != null && Number.isFinite(Number(n.createdAt))
        ? new Date(Number(n.createdAt))
        : n.date
          ? new Date(n.date)
          : new Date(0);
    if (Number.isNaN(when.getTime())) return;
    items.push({
      type: 'note',
      id: `internal-note-${candidateId}-${n.id}`,
      createdAt: when.toISOString(),
      title: 'Internal note',
      description: String(n.text ?? '').trim(),
      recruiterName: candidateRecruiterName || undefined,
    });
  });

  const candEmail = String((candidateDoc as { email?: string } | null)?.email ?? '')
    .trim()
    .toLowerCase();
  if (candEmail) {
    const emailFilter: Record<string, unknown> = { to: candEmail };
    if (role !== 'admin') {
      emailFilter.userId = new mongoose.Types.ObjectId(userId);
    }
    const emailLogs = await EmailLog.find(emailFilter)
      .sort({ createdAt: -1 })
      .limit(80)
      .populate('userId', 'name')
      .lean();
    for (const e of emailLogs) {
      const doc = e as {
        _id: mongoose.Types.ObjectId;
        createdAt: Date;
        subject: string;
        from: string;
        userId?: { name?: string } | mongoose.Types.ObjectId;
      };
      const sender =
        doc.userId && typeof doc.userId === 'object' && 'name' in doc.userId && doc.userId.name
          ? doc.userId.name
          : doc.from;
      items.push({
        type: 'note',
        id: `email-${doc._id.toString()}`,
        createdAt: doc.createdAt.toISOString(),
        title: 'Email sent',
        description: doc.subject,
        recruiterName: sender || undefined,
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: items });
});
