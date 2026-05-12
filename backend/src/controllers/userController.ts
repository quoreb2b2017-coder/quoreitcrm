import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import type { CreateUserInput, UpdateProfileInput } from '../validations/authSchemas.js';
import type { User as SharedUser } from '@ats-saas/shared';
import mongoose from 'mongoose';
import { Candidate } from '../models/Candidate.js';
import { Application, type ApplicationStatus } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Project } from '../models/Project.js';
import { getRecruiterJobIds } from '../utils/recruiterAccess.js';

type UserDoc = {
  _id: { toString: () => string } | mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  company?: string;
  bio?: string;
  introVideoUrl?: string;
  phoneNumbers?: string[];
  phoneConnected?: boolean;
  googleConnected?: boolean;
  googleEmail?: string;
  gmailConnected?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toUserResponse(user: UserDoc): SharedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as SharedUser['role'],
    avatar: user.avatar,
    company: user.company,
    bio: user.bio,
    introVideoUrl: user.introVideoUrl,
    phoneNumbers: user.phoneNumbers,
    phoneConnected: user.phoneConnected,
    googleConnected: user.googleConnected,
    googleEmail: user.googleEmail,
    gmailConnected: user.gmailConnected,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) throw new AppError(404, 'User not found');
  res.json({
    success: true,
    data: toUserResponse(user as UserDoc),
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const body = req.body as UpdateProfileInput;
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  if (body.name !== undefined) user.name = body.name;
  if (body.avatar !== undefined) user.avatar = body.avatar || undefined;
  if (body.company !== undefined) user.company = body.company || undefined;
  if (body.bio !== undefined) user.bio = body.bio || undefined;
  if (body.introVideoUrl !== undefined) user.introVideoUrl = body.introVideoUrl || undefined;
  if (body.phoneNumbers !== undefined) user.phoneNumbers = body.phoneNumbers;
  if (body.phoneConnected !== undefined) user.phoneConnected = body.phoneConnected;
  if (body.googleConnected !== undefined) user.googleConnected = body.googleConnected;
  await user.save();
  const updated = await User.findById(userId).select('-password').lean();
  res.json({
    success: true,
    data: toUserResponse(updated as UserDoc),
  });
});

export const listRecruiters = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find({ role: 'recruiter' })
    .select('_id name email')
    .sort({ name: 1 })
    .lean();
  res.json({
    success: true,
    data: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
    })),
  });
});

/** Count users by role and include all platform metrics for management page. */
export const getRoleCounts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  
  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Recruiter scope: only jobs they have *accepted*. Other recruiters' data must
  // not leak into their counts. Admin sees everything.
  const recruiterJobIds = role === 'recruiter' ? await getRecruiterJobIds(userId) : [];
  const jobFilter = role === 'admin' ? {} : { _id: { $in: recruiterJobIds } };
  const projectFilter = role === 'admin' ? {} : { recruiterId: userObjectId };
  const candidateFilter = role === 'admin'
    ? {}
    : {
        recruiterId: userObjectId,
        $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }, { isBlocked: null }],
      };
  const ownApplicationPipeline: mongoose.PipelineStage[] = role === 'admin'
    ? []
    : [
        { $match: { jobId: { $in: recruiterJobIds } } },
        {
          $lookup: {
            from: 'candidates',
            localField: 'crmCandidateId',
            foreignField: '_id',
            as: 'crmCandidate',
          },
        },
        { $unwind: '$crmCandidate' },
        {
          $match: {
            'crmCandidate.recruiterId': userObjectId,
            $or: [
              { 'crmCandidate.isBlocked': false },
              { 'crmCandidate.isBlocked': { $exists: false } },
              { 'crmCandidate.isBlocked': null },
            ],
          },
        },
      ];

  const [admin, recruiter, candidateRole, crmCandidateCount, appStats, jobsCount, projectsCount] = await Promise.all([
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'recruiter' }),
    User.countDocuments({ role: 'candidate' }),
    Candidate.countDocuments(candidateFilter),
    Application.aggregate([
      ...ownApplicationPipeline,
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec(),
    Job.countDocuments(jobFilter),
    Project.countDocuments(projectFilter),
  ]);

  const statsMap = Object.fromEntries(
    (appStats as { _id: string; count: number }[]).map((s) => [s._id, s.count])
  );

  res.json({
    success: true,
    data: {
      admin,
      recruiter,
      candidateRole,
      crmCandidate: crmCandidateCount,
      jobs: jobsCount,
      projects: projectsCount,
      applied: statsMap['applied'] ?? 0,
      screening: statsMap['screening'] ?? 0,
      interview: statsMap['interview'] ?? 0,
      offered: statsMap['offered'] ?? 0,
      hired: statsMap['hired'] ?? 0,
      rejected: statsMap['rejected'] ?? 0,
    },
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find({ role: { $in: ['admin', 'recruiter'] } })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();
  res.json({
    success: true,
    data: users.map((u) => toUserResponse(u as UserDoc)),
  });
});

export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateUserInput;
  if (req.user?.role !== 'admin') {
    throw new AppError(403, 'Only admins can create user accounts.');
  }
  const existing = await User.findOne({ email: body.email }).select('_id');
  if (existing) {
    throw new AppError(409, 'A user with this email already exists');
  }
  const hashed = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    name: body.name,
    email: body.email,
    password: hashed,
    role: body.role,
  });
  res.status(201).json({
    success: true,
    data: toUserResponse(user),
  });
});
