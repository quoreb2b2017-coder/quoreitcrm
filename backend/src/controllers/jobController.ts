import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Candidate } from '../models/Candidate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
  apiStatusToDb,
  dbStatusToApi,
  type CreateJobInput,
  type UpdateJobInput,
  type ListJobsQuery,
  type AssignRecruitersInput,
} from '../validations/jobSchemas.js';
import { sendSystemMessage } from './messageController.js';

type JobDoc = {
  _id: { toString: () => string };
  title: string;
  description: string;
  skills: string[];
  salary: string;
  location: string;
  requirements: string[];
  customFields: { name: string; value: string }[];
  recruiterIds?: { _id: { toString: () => string }; name: string; email: string }[];
  recruiterAssignments?: { recruiterId: any; status: string; acceptedAt?: Date }[];
  status: string;
  workplaceType?: string;
  roleType?: string;
  companyName?: string;
  companyLogo?: string;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    totalCandidates: number;
    interviewing: number;
    openings: number;
    activeRecruiters: number;
  };
};

function toJobResponse(job: JobDoc) {
  const recs = job.recruiterIds || [];
  return {
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    skills: job.skills,
    salary: job.salary,
    location: job.location,
    requirements: job.requirements || [],
    customFields: job.customFields || [],
    recruiterIds: recs.map(r => r._id.toString()),
    recruiters: recs.map(r => ({ id: r._id.toString(), name: r.name, email: r.email })),
    recruiterAssignments: (job.recruiterAssignments || []).map(a => {
      const rec = a.recruiterId as any;
      return {
        recruiterId: rec?._id?.toString() || rec?.toString() || '',
        recruiterName: rec?.name || '',
        recruiterEmail: rec?.email || '',
        status: a.status,
        acceptedAt: a.acceptedAt?.toISOString()
      };
    }),
    status: dbStatusToApi(job.status),
    workplaceType: job.workplaceType || '',
    roleType: job.roleType || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    stats: job.stats || { totalCandidates: 0, interviewing: 0, openings: 1, activeRecruiters: 0 },
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export const listJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as ListJobsQuery & { forRoleDropdown?: boolean };
  const { page = 1, limit = 10, status, recruiterId: filterRecruiterId, search, forRoleDropdown } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  const role = req.user?.role;
  const userId = req.user?.userId;

  // For Role dropdown: recruiter sees only accepted jobs, admin sees all
  if (forRoleDropdown && role === 'recruiter' && userId) {
    filter.recruiterAssignments = {
      $elemMatch: {
        recruiterId: new mongoose.Types.ObjectId(userId),
        status: 'accepted'
      }
    };
  } else {
    // Standard filtering
    if (typeof filterRecruiterId === 'string' && filterRecruiterId.trim() && OBJECT_ID_REGEX.test(filterRecruiterId.trim())) {
      filter.recruiterIds = filterRecruiterId.trim();
    }
  }

  if (status) {
    filter.status = status === 'closed' ? 'closed' : { $in: ['draft', 'published'] };
  }
  if (search?.trim()) {
    const q = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { companyName: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiterIds', 'name email')
      .populate('recruiterAssignments.recruiterId', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const jobIds = items.map((j) => j._id);

  // Aggregate stats: admin sees all, recruiter sees only their submissions
  const statsAggregate = await (async () => {
    if (role === 'admin') {
      return Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        {
          $group: {
            _id: '$jobId',
            totalCandidates: { $sum: 1 },
            interviewing: {
              $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] },
            },
          },
        },
      ]);
    } else {
      const recruiterOid = new mongoose.Types.ObjectId(userId!);
      return Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        {
          $lookup: {
            from: 'candidates',
            localField: 'crmCandidateId',
            foreignField: '_id',
            as: 'candidate',
          },
        },
        { $unwind: '$candidate' },
        { $match: { 'candidate.recruiterId': recruiterOid } },
        {
          $group: {
            _id: '$jobId',
            totalCandidates: { $sum: 1 },
            interviewing: {
              $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] },
            },
          },
        },
      ]);
    }
  })();

  const statsMap = new Map(
    statsAggregate.map((s) => [
      s._id.toString(),
      {
        totalCandidates: s.totalCandidates,
        interviewing: s.interviewing,
      },
    ])
  );

  const formattedItems = items.map((j) => {
    const jobData = j as unknown as JobDoc;
    const stats = statsMap.get(jobData._id.toString()) || { totalCandidates: 0, interviewing: 0 };
    const openings = jobData.stats?.openings || 1;
    const activeRecruiters = jobData.recruiterAssignments?.filter(a => a.status === 'accepted').length || 0;
    jobData.stats = { ...stats, openings, activeRecruiters };
    return toJobResponse(jobData);
  });

  const totalPages = Math.ceil(total / limit);
  res.json({
    success: true,
    data: {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages,
    },
  });
});

function getRecruiterIdsFromJob(job: { recruiterIds?: unknown }): string[] {
  const recs = job.recruiterIds;
  if (!Array.isArray(recs)) return [];
  return recs.map(rec => {
    if (typeof rec === 'object' && rec !== null && '_id' in rec) {
      return (rec as { _id: { toString: () => string } })._id?.toString?.() ?? '';
    }
    return (rec as { toString: () => string })?.toString?.() ?? '';
  }).filter(Boolean);
}

export const getJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id)
    .populate('recruiterIds', 'name email')
    .populate('recruiterAssignments.recruiterId', 'name email')
    .lean();
  if (!job) throw new AppError(404, 'Job not found');

  const recruiterIds = getRecruiterIdsFromJob(job);
  // Recruiter can view unassigned jobs to request access
  // We removed the restriction here too.

  const [totalCandidates, interviewing] = await (async () => {
    if (req.user?.role === 'admin') {
      return Promise.all([
        Application.countDocuments({ jobId: job._id }),
        Application.countDocuments({ jobId: job._id, status: 'interview' })
      ]);
    } else {
      // Need to find candidates submitted by THIS recruiter for THIS job
      const recruiterOid = new (Candidate.base.Types.ObjectId)(req.user?.userId);
      const myCandidates = await Candidate.find({ jobId: job._id, recruiterId: recruiterOid }).select('_id').lean();
      const myCandidateIds = myCandidates.map(c => c._id);

      return Promise.all([
        Application.countDocuments({ jobId: job._id, crmCandidateId: { $in: myCandidateIds } }),
        Application.countDocuments({ jobId: job._id, status: 'interview', crmCandidateId: { $in: myCandidateIds } })
      ]);
    }
  })();

  const jobDoc = job as unknown as JobDoc;
  const activeRecruiters = jobDoc.recruiterAssignments?.filter(a => a.status === 'accepted').length || 0;
  jobDoc.stats = { totalCandidates, interviewing, openings: jobDoc.stats?.openings || 1, activeRecruiters };

  res.json({ success: true, data: toJobResponse(jobDoc) });
});

export const createJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateJobInput;
  const job = await Job.create({
    title: body.title,
    description: body.description ?? '',
    skills: body.skills ?? [],
    salary: body.salary ?? '',
    location: body.location ?? '',
    requirements: body.requirements ?? [],
    customFields: body.customFields ?? [],
    recruiterIds: body.recruiterIds ?? [],
    status: apiStatusToDb(body.status ?? 'open'),
    benefits: body.benefits ?? [],
    personalQuestions: body.personalQuestions ?? [],
    workplaceType: body.workplaceType ?? '',
    roleType: body.roleType ?? '',
    companyName: body.companyName ?? '',
    companyLogo: body.companyLogo ?? '',
    stats: {
      totalCandidates: 0,
      interviewing: 0,
      openings: body.openings ?? 1
    }
  });
  const populated = await Job.findById(job._id).populate('recruiterIds', 'name email').lean();
  res.status(201).json({ success: true, data: toJobResponse(populated as unknown as JobDoc) });
});

export const updateJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as UpdateJobInput;
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.description !== undefined) update.description = body.description;
  if (body.skills !== undefined) update.skills = body.skills;
  if (body.salary !== undefined) update.salary = body.salary;
  if (body.location !== undefined) update.location = body.location;
  if (body.requirements !== undefined) update.requirements = body.requirements;
  if (body.customFields !== undefined) update.customFields = body.customFields;
  if (body.recruiterIds !== undefined) update.recruiterIds = body.recruiterIds;
  if (body.status !== undefined) update.status = apiStatusToDb(body.status);
  if (body.benefits !== undefined) update.benefits = body.benefits;
  if (body.personalQuestions !== undefined) update.personalQuestions = body.personalQuestions;
  if (body.workplaceType !== undefined) update.workplaceType = body.workplaceType;
  if (body.roleType !== undefined) update.roleType = body.roleType;
  if (body.companyName !== undefined) update.companyName = body.companyName;
  if (body.companyLogo !== undefined) update.companyLogo = body.companyLogo;

  if (body.openings !== undefined) {
    update['stats.openings'] = body.openings;
  }
  const job = await Job.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('recruiterIds', 'name email')
    .lean();
  if (!job) throw new AppError(404, 'Job not found');

  const jobDoc = job as unknown as JobDoc;
  const activeRecruiters = jobDoc.recruiterAssignments?.filter(a => a.status === 'accepted').length || 0;

  // Recalculate basic stats for the response
  const [totalCandidates, interviewing] = await Promise.all([
    Application.countDocuments({ jobId: jobDoc._id }),
    Application.countDocuments({ jobId: jobDoc._id, status: 'interview' })
  ]);

  jobDoc.stats = {
    totalCandidates,
    interviewing,
    openings: jobDoc.stats?.openings || 1,
    activeRecruiters
  };

  res.json({ success: true, data: toJobResponse(jobDoc) });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new AppError(404, 'Job not found');
  res.json({ success: true, message: 'Job deleted' });
});

export const assignRecruiters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { recruiterIds = [] } = req.body as AssignRecruitersInput;

  if (recruiterIds.length > 0) {
    const users = await User.find({ _id: { $in: recruiterIds } }).select('role').lean();
    if (users.some(u => u.role !== 'recruiter')) {
      throw new AppError(400, 'Can only assign users with recruiter role');
    }
  }

  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError(404, 'Job not found');

  // Sync recruiterAssignments
  const existingAssignments = new Map(job.recruiterAssignments.map(a => [a.recruiterId.toString(), a.status]));
  const newAssignments = recruiterIds.map(id => ({
    recruiterId: id as any,
    status: existingAssignments.get(id) || 'pending'
  }));

  job.recruiterIds = recruiterIds as any;
  job.recruiterAssignments = newAssignments as any;

  await job.save();
  const populated = await Job.findById(job._id).populate('recruiterIds', 'name email').lean();
  res.json({ success: true, data: toJobResponse(populated as unknown as JobDoc) });
});

export const acceptJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params.id;
  const recruiterId = req.user?.userId;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found');

  let assignment = job.recruiterAssignments.find(a => a.recruiterId.toString() === recruiterId);
  if (!assignment) {
    if (job.recruiterIds.some(id => id.toString() === recruiterId)) {
      assignment = { recruiterId, status: 'accepted', acceptedAt: new Date() } as any;
      job.recruiterAssignments.push(assignment as any);
    } else {
      throw new AppError(403, 'You are not assigned to this job');
    }
  } else {
    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();
  }

  await job.save();

  // Trigger system welcome message
  const user = await User.findById(recruiterId).select('name').lean();
  await sendSystemMessage(jobId, user?.name || 'Recruiter');

  res.json({ success: true, message: 'Job accepted' });
});

export const rejectJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params.id;
  const recruiterId = req.user?.userId;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found');

  let assignment = job.recruiterAssignments.find(a => a.recruiterId.toString() === recruiterId);
  if (!assignment) {
    if (job.recruiterIds.some(id => id.toString() === recruiterId)) {
      assignment = { recruiterId, status: 'rejected' } as any;
      job.recruiterAssignments.push(assignment as any);
    } else {
      throw new AppError(403, 'You are not assigned to this job');
    }
  } else {
    assignment.status = 'rejected';
  }

  await job.save();

  res.json({ success: true, message: 'Job rejected' });
});

export const requestJobAccess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params.id;
  const recruiterId = req.user?.userId;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found');

  let assignment = job.recruiterAssignments.find(a => a.recruiterId.toString() === recruiterId);
  if (assignment) {
    if (assignment.status === 'requested') throw new AppError(400, 'Access already requested');
    throw new AppError(400, `You already have ${assignment.status} access`);
  }

  job.recruiterAssignments.push({ recruiterId, status: 'requested' } as any);
  if (!job.recruiterIds.some(id => id.toString() === recruiterId)) {
    job.recruiterIds.push(recruiterId as any);
  }

  await job.save();
  res.json({ success: true, message: 'Access requested' });
});

export const approveJobAccess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id: jobId, recruiterId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found');

  let assignment = job.recruiterAssignments.find(a => a.recruiterId.toString() === recruiterId);
  if (!assignment) throw new AppError(404, 'Request not found');

  assignment.status = 'accepted';
  assignment.acceptedAt = new Date() as any;

  await job.save();

  // Trigger system welcome message
  const user = await User.findById(recruiterId).select('name').lean();
  await sendSystemMessage(jobId, user?.name || 'Recruiter');

  res.json({ success: true, message: 'Access approved' });
});
