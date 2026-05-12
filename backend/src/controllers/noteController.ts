import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { canRecruiterAccessCandidate } from '../utils/recruiterAccess.js';
import type { INote } from '../models/Note.js';
import type { CreateNoteInput, UpdateNoteInput } from '../validations/activitySchemas.js';
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

function toNoteResponse(note: INote & { createdAt: Date; updatedAt: Date }, recruiterName?: string) {
  return {
    id: note._id.toString(),
    candidateId: note.candidateId.toString(),
    recruiterId: note.recruiterId.toString(),
    title: note.title,
    description: note.description ?? '',
    tags: note.tags?.map((t) => t.toString()) ?? [],
    isPinned: note.isPinned ?? false,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    recruiterName: recruiterName ?? undefined,
  };
}

/** GET notes by candidateId */
export const getByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.candidateId;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');
  if (!(await canAccessCandidate(userId, role, candidateId))) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const notes = await Note.find({ candidateId: new mongoose.Types.ObjectId(candidateId) })
    .sort({ isPinned: -1, createdAt: -1 })
    .populate('recruiterId', 'name')
    .lean();

  const list = notes.map((n) => {
    const rec = n.recruiterId as unknown as { name: string } | null;
    return toNoteResponse(n as INote & { createdAt: Date; updatedAt: Date }, rec?.name);
  });

  res.json({ success: true, data: list });
});

/** POST create note */
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateNoteInput;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');
  if (!(await canAccessCandidate(userId, role, body.candidateId))) {
    throw new AppError(403, 'You do not have access to this candidate');
  }

  const note = await Note.create({
    candidateId: new mongoose.Types.ObjectId(body.candidateId),
    recruiterId: new mongoose.Types.ObjectId(userId),
    title: body.title,
    description: body.description ?? '',
    tags: (body.tags ?? []).map((id) => new mongoose.Types.ObjectId(id)),
    isPinned: body.isPinned ?? false,
  });

  pushActivity(body.candidateId, 'note_added', `Note added: ${body.title}`).catch(() => {});

  const user = await User.findById(userId).select('name').lean();
  res.status(201).json({
    success: true,
    data: toNoteResponse(note as INote & { createdAt: Date; updatedAt: Date }, user?.name),
  });
});

/** PUT update note */
export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const noteId = req.params.noteId;
  const body = req.body as UpdateNoteInput;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  const note = await Note.findById(noteId).lean();
  if (!note) throw new AppError(404, 'Note not found');
  const candidateIdStr = (note as { candidateId: mongoose.Types.ObjectId }).candidateId?.toString();
  if (!candidateIdStr || !(await canAccessCandidate(userId, role, candidateIdStr))) {
    throw new AppError(403, 'You do not have access to this note');
  }

  const updateFields: Record<string, unknown> = {};
  if (body.title !== undefined) updateFields.title = body.title;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.tags !== undefined) updateFields.tags = body.tags.map((id) => new mongoose.Types.ObjectId(id));
  if (body.isPinned !== undefined) updateFields.isPinned = body.isPinned;

  const updated = await Note.findByIdAndUpdate(noteId, updateFields, { new: true })
    .populate('recruiterId', 'name')
    .lean();
  if (!updated) throw new AppError(404, 'Note not found');

  pushActivity(
    (updated as { candidateId: mongoose.Types.ObjectId }).candidateId.toString(),
    'note_updated',
    `Note updated: ${(updated as { title: string }).title}`
  ).catch(() => {});

  const rec = updated.recruiterId as unknown as { name: string } | null;
  res.json({
    success: true,
    data: toNoteResponse(updated as INote & { createdAt: Date; updatedAt: Date }, rec?.name),
  });
});

/** DELETE note */
export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const noteId = req.params.noteId;
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  const note = await Note.findById(noteId).lean();
  if (!note) throw new AppError(404, 'Note not found');
  const noteCandidateId = (note as { candidateId: mongoose.Types.ObjectId }).candidateId?.toString();
  if (!noteCandidateId || !(await canAccessCandidate(userId, role, noteCandidateId))) {
    throw new AppError(403, 'You do not have access to this note');
  }

  const noteCandidateId2 = (note as { candidateId: mongoose.Types.ObjectId }).candidateId?.toString();
  await Note.findByIdAndDelete(noteId);
  if (noteCandidateId2) {
    pushActivity(noteCandidateId2, 'note_deleted', `Note deleted: ${(note as { title: string }).title}`).catch(() => {});
  }
  res.json({ success: true, data: { message: 'Note deleted' } });
});
