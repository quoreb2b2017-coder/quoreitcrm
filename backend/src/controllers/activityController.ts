import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';

/** GET list of candidates the current user can view activity for (for dropdown) */
export const listCandidates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(401, 'Authentication required');

  const staffRoles = ['admin', 'recruiter'];
  if (!staffRoles.includes(role)) {
    return void res.json({ success: true, data: [] });
  }

  let jobFilter: Record<string, unknown> = {};
  if (role === 'recruiter') {
    jobFilter = { recruiterId: new mongoose.Types.ObjectId(userId) };
  }

  const jobIds = await Job.find(jobFilter).select('_id').lean();
  const ids = jobIds.map((j) => j._id);
  if (ids.length === 0) {
    return void res.json({ success: true, data: [] });
  }

  const applications = await Application.find({ jobId: { $in: ids } })
    .select('candidateId')
    .populate('candidateId', 'name email')
    .lean();

  const seen = new Set<string>();
  const candidates: Array<{ id: string; name: string; email: string }> = [];
  for (const app of applications) {
    const c = app.candidateId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string } | null;
    if (!c || !c._id) continue;
    const id = c._id.toString();
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push({
      id,
      name: c.name ?? 'Unknown',
      email: c.email ?? '',
    });
  }

  candidates.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ success: true, data: candidates });
});
