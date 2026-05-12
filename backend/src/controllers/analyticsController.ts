import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import { Project } from '../models/Project.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { getRecruiterJobIds } from '../utils/recruiterAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Dashboard analytics.
 *
 * Admin sees platform-wide data.
 * Recruiter sees only:
 * - jobs/clients assigned to them
 * - candidates they own
 * - applications for their own CRM candidates on their assigned jobs
 */
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  // Strict scope: a recruiter's dashboard only includes jobs they have actually
  // *accepted*. Pending/requested invitations are not part of "their" data.
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

  const [
    totalJobs,
    totalCandidates,
    totalApplicants,
    totalProjects,
    pipelineStats,
    hiresPerMonth,
  ] = await Promise.all([
    Job.countDocuments(jobFilter),
    Candidate.countDocuments(candidateFilter),
    role === 'admin'
      ? Application.countDocuments({})
      : Application.aggregate([...ownApplicationPipeline, { $count: 'count' }]).then((rows) => rows[0]?.count ?? 0),
    Project.countDocuments(projectFilter),
    Application.aggregate([
      ...ownApplicationPipeline,
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).exec(),
    Application.aggregate([
      ...ownApplicationPipeline,
      { $match: { status: 'hired' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]).exec(),
  ]);

  const pipelineMap = Object.fromEntries(
    (pipelineStats as { _id: string; count: number }[]).map((p) => [p._id, p.count])
  );
  const totalHires = pipelineMap['hired'] ?? 0;
  const totalInterviews = pipelineMap['interview'] ?? 0;

  const pipelineStatus = (pipelineStats as { _id: string; count: number }[]).map((p) => ({
    status: p._id,
    count: p.count,
  }));

  const hiresPerMonthFormatted = (hiresPerMonth as { _id: { year: number; month: number }; count: number }[]).map(
    (p) => ({
      year: p._id.year,
      month: p._id.month,
      label: `${p._id.year}-${String(p._id.month).padStart(2, '0')}`,
      count: p.count,
    })
  );

  res.json({
    success: true,
    data: {
      totalJobs,
      totalCandidates,
      totalApplicants,
      totalProjects,
      totalHires,
      totalInterviews,
      pipelineStatus,
      hiresPerMonth: hiresPerMonthFormatted,
    },
  });
});
