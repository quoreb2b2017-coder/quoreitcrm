import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

type LookupPipelineStage = Exclude<
  mongoose.PipelineStage,
  mongoose.PipelineStage.Merge | mongoose.PipelineStage.Out
>;

/**
 * GET /clients
 *
 * Lists "clients" (jobs the user can act on) for the recruiter dashboard.
 *
 * Authorization:
 *   - admin     → sees every job
 *   - recruiter → sees only jobs they have a `recruiterAssignments` entry for
 *                 (any status — accepted / pending / requested / rejected).
 *                 Jobs are not surfaced based on the loose `recruiterIds` array
 *                 because that can contain self-requested ids that the admin
 *                 has not yet approved.
 *   - anyone else → 403.
 *
 * Performance:
 *   - Uses a single aggregation pipeline: $match → $lookup applications →
 *     $project derived fields. This replaces the previous N+1 (Job.find →
 *     Application.aggregate → manual Map join).
 */
export const listClients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;

  if (!userId || (role !== 'admin' && role !== 'recruiter')) {
    throw new AppError(403, 'You do not have permission to view clients');
  }

  const isAdmin = role === 'admin';
  const recruiterOid = !isAdmin && userId ? new mongoose.Types.ObjectId(userId) : null;

  // Recruiters only see jobs they actually have an assignment record for —
  // not every job that happens to list them in recruiterIds.
  const match: Record<string, unknown> = isAdmin
    ? {}
    : { 'recruiterAssignments.recruiterId': recruiterOid };

  const appStatsPipeline: mongoose.PipelineStage[] = [
    { $match: { $expr: { $eq: ['$jobId', '$$jobId'] } } },
    ...(!isAdmin && recruiterOid
      ? [
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
              'crmCandidate.recruiterId': recruiterOid,
              $or: [
                { 'crmCandidate.isBlocked': false },
                { 'crmCandidate.isBlocked': { $exists: false } },
                { 'crmCandidate.isBlocked': null },
              ],
            },
          },
        ]
      : []),
    {
      $group: {
        _id: null,
        submitted: { $sum: 1 },
        interviewing: {
          $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] },
        },
      },
    },
  ];

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    { $sort: { updatedAt: -1 } },
    {
      $lookup: {
        from: 'applications',
        let: { jobId: '$_id' },
        pipeline: appStatsPipeline as LookupPipelineStage[],
        as: 'appStats',
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        companyName: 1,
        companyLogo: 1,
        reward: 1,
        salary: 1,
        location: 1,
        roleType: 1,
        requirements: 1,
        idealCandidate: 1,
        recruiterIds: 1,
        recruiterAssignments: 1,
        status: 1,
        stats: 1,
        updatedAt: 1,
        submitted: { $ifNull: [{ $arrayElemAt: ['$appStats.submitted', 0] }, 0] },
        interviewing: { $ifNull: [{ $arrayElemAt: ['$appStats.interviewing', 0] }, 0] },
      },
    },
  ];

  const jobs = await Job.aggregate(pipeline);

  const formatted = jobs.map((job) => {
    let status = 'Pending Request';
    let lastActive: Date | undefined = job.updatedAt;

    if (!isAdmin && recruiterOid) {
      const assignment = (job.recruiterAssignments || []).find(
        (a: { recruiterId: mongoose.Types.ObjectId; status: string; acceptedAt?: Date }) =>
          a.recruiterId?.toString() === recruiterOid.toString()
      );
      if (assignment?.status === 'accepted') status = 'Active';
      else if (assignment?.status === 'pending') status = 'Invites';
      else if (assignment?.status === 'requested') status = 'Pending Request';
      else if (assignment?.status === 'rejected') status = 'Rejected';

      if (assignment?.acceptedAt) lastActive = assignment.acceptedAt;
    } else {
      // Admin: derive a global status from the assignment list.
      const assignments = (job.recruiterAssignments || []) as { status: string }[];
      const hasAccepted = assignments.some((a) => a.status === 'accepted');
      const hasPending = assignments.some((a) => a.status === 'pending');
      const hasRequested = assignments.some((a) => a.status === 'requested');
      if (hasAccepted) status = 'Active';
      else if (hasPending || hasRequested) status = 'Invites';
      else status = 'Pending Request';
    }

    return {
      id: job._id.toString(),
      companyName: job.companyName || 'Unknown',
      companyLogo: job.companyLogo,
      title: job.title,
      reward: job.reward || '–',
      salary: job.salary || '–',
      status,
      totalInterviewing: job.interviewing || 0,
      submitted: job.submitted || 0,
      interviewing: job.interviewing || 0,
      rating: 'New',
      lastActive,
      hiringCount: job.stats?.openings || 1,
      requirements: job.requirements || [],
      idealCandidate: job.idealCandidate,
      location: job.location || '',
      roleType: job.roleType || '',
      jobStatus: job.status || 'draft',
      recruiterIds: (job.recruiterIds || []).map((id: mongoose.Types.ObjectId) => id.toString()),
    };
  });

  res.json({ success: true, data: formatted });
});
