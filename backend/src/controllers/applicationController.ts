import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { getRecruiterJobIds } from '../utils/recruiterAccess.js';
import type { IApplication } from '../models/Application.js';
import type { ApplicationStatus } from '../models/Application.js';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offered',
  'hired',
  'rejected',
];

function toAppItem(
  app: IApplication & { createdAt: Date; updatedAt: Date },
  candidate?: { name: string; email: string } | null,
  job?: { title: string } | null,
  resumeUrl?: string | null
) {
  const candidateIdStr = app.candidateId?.toString() ?? app.crmCandidateId?.toString() ?? '';
  return {
    id: app._id.toString(),
    jobId: app.jobId.toString(),
    candidateId: candidateIdStr,
    stage: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    candidate: candidate ?? null,
    job: job ?? null,
    resumeUrl: resumeUrl ?? null,
  };
}

/** POST add existing CRM candidate to a job's pipeline (staff only). Creates application in Applied. */
export const addToPipeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  if (!userId) throw new AppError(401, 'Authentication required');

  const { jobId, crmCandidateId } = req.body as { jobId: string; crmCandidateId: string };
  const job = await Job.findById(jobId).select('recruiterAssignments title').lean();
  if (!job) throw new AppError(404, 'Job not found');
  const isAssignedAndAccepted = (job.recruiterAssignments || []).some(
    a => a.recruiterId.toString() === userId && a.status === 'accepted'
  );
  if (role !== 'admin' && !isAssignedAndAccepted) {
    throw new AppError(403, 'You can only add candidates to jobs assigned to you (and accepted)');
  }

  const candidate = await Candidate.findById(crmCandidateId).select('recruiterId').lean();
  if (!candidate) throw new AppError(404, 'Candidate not found');
  if (role !== 'admin' && (candidate as { recruiterId: mongoose.Types.ObjectId }).recruiterId.toString() !== userId) {
    throw new AppError(403, 'You can only add your own candidates to the pipeline');
  }

  const jobOid = new mongoose.Types.ObjectId(jobId);
  const candidateOid = new mongoose.Types.ObjectId(crmCandidateId);
  let app = await Application.findOne({ jobId: jobOid, crmCandidateId: candidateOid }).lean();
  if (app) {
    const jobTitle = (job as { title?: string }).title ?? '';
    return void res.status(200).json({
      success: true,
      data: toAppItem(app as IApplication & { createdAt: Date; updatedAt: Date }, null, { title: jobTitle }, null),
    });
  }
  const created = await Application.create({
    jobId: jobOid,
    crmCandidateId: candidateOid,
    status: 'applied',
  });
  const withJob = await Application.findById(created._id).populate('jobId', 'title').populate('crmCandidateId', 'name email').lean();
  const crm = withJob?.crmCandidateId as unknown as { name: string; email: string } | null;
  const jobRef = withJob?.jobId as unknown as { title: string } | null;
  res.status(201).json({
    success: true,
    data: toAppItem(
      created as IApplication & { createdAt: Date; updatedAt: Date },
      crm && typeof crm === 'object' && 'name' in crm ? { name: crm.name, email: crm.email } : null,
      jobRef && typeof jobRef === 'object' && 'title' in jobRef ? { title: jobRef.title } : null,
      null
    ),
  });
});

/** POST apply to job (candidate only). Resume auto-attached from profile. Prevents duplicate. */
export const apply = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.user?.userId;
  if (!candidateId) throw new AppError(401, 'Authentication required');

  const { jobId } = req.body as { jobId: string };
  const job = await Job.findById(jobId).select('status').lean();
  if (!job) throw new AppError(404, 'Job not found');
  if (job.status !== 'published') {
    throw new AppError(400, 'Job is not accepting applications');
  }

  const existing = await Application.findOne({
    jobId: new mongoose.Types.ObjectId(jobId),
    candidateId: new mongoose.Types.ObjectId(candidateId),
  }).select('_id').lean();
  if (existing) throw new AppError(409, 'You have already applied to this job');

  const app = await Application.create({
    jobId,
    candidateId,
    status: 'applied',
  });
  const profile = await CandidateProfile.findOne({ userId: new mongoose.Types.ObjectId(candidateId) }).select('resumePath').lean();
  res.status(201).json({
    success: true,
    data: toAppItem(app, undefined, undefined, profile?.resumePath ?? null),
  });
});

/** GET list applications (staff: by jobId; candidate: own only) */
export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  const query = req.query as { jobId?: string; candidateId?: string; stage?: string; page?: string; limit?: string };

  const filter: Record<string, unknown> = {};
  const recruiterJobIds = role === 'recruiter' && userId ? await getRecruiterJobIds(userId) : [];

  if (role === 'recruiter' && userId) {
    if (recruiterJobIds.length === 0) {
      return void res.json({
        success: true,
        data: { items: [], total: 0, page: 1, limit: 50, totalPages: 0 },
      });
    }
    if (query.jobId) {
      if (!recruiterJobIds.some((id) => id.toString() === query.jobId)) {
        throw new AppError(403, 'You can only view applications for jobs assigned to you');
      }
      filter.jobId = new mongoose.Types.ObjectId(query.jobId);
    } else {
      filter.jobId = { $in: recruiterJobIds };
    }
  } else if (query.jobId) {
    filter.jobId = new mongoose.Types.ObjectId(query.jobId);
  }

  if (query.stage && PIPELINE_STAGES.includes(query.stage as ApplicationStatus)) {
    filter.status = query.stage;
  }
  if (query.candidateId) {
    filter.$or = [
      { candidateId: new mongoose.Types.ObjectId(query.candidateId) },
      { crmCandidateId: new mongoose.Types.ObjectId(query.candidateId) },
    ];
  }

  // Ensure every candidate with this job has an application (sync pipeline with Candidates list)
  if (query.jobId && (role === 'admin' || role === 'recruiter')) {
    const jobOid = new mongoose.Types.ObjectId(query.jobId);
    const candidateFilter: Record<string, unknown> = { jobId: jobOid };
    if (role === 'recruiter' && userId) {
      candidateFilter.recruiterId = new mongoose.Types.ObjectId(userId);
    }
    const [candidatesWithJob, existingApps] = await Promise.all([
      Candidate.find(candidateFilter).select('_id').lean(),
      Application.find({ jobId: jobOid }).select('crmCandidateId').lean(),
    ]);
    const existingCrmIds = new Set(
      existingApps
        .map((a) => (a as { crmCandidateId?: mongoose.Types.ObjectId }).crmCandidateId?.toString())
        .filter(Boolean)
    );
    const missing = candidatesWithJob
      .map((c) => c._id)
      .filter((id) => !existingCrmIds.has(id.toString()));
    if (missing.length > 0) {
      await Application.insertMany(
        missing.map((cid) => ({ jobId: jobOid, crmCandidateId: cid, status: 'applied' })),
        { ordered: false }
      ).catch(() => {/* ignore duplicate key errors */});
    }
  }

  if (role === 'recruiter' && userId) {
    const candidateJobFilter: Record<string, unknown> = {
      recruiterId: new mongoose.Types.ObjectId(userId),
      $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }, { isBlocked: null }],
    };
    if (query.jobId) {
      candidateJobFilter.jobId = new mongoose.Types.ObjectId(query.jobId);
    } else {
      candidateJobFilter.jobId = { $in: recruiterJobIds };
    }

    const ownedCandidates = await Candidate.find(candidateJobFilter).select('_id').lean();
    const ownedCandidateIds = ownedCandidates.map((candidate) => candidate._id);

    if (query.candidateId && !ownedCandidateIds.some((id) => id.toString() === query.candidateId)) {
      return void res.json({
        success: true,
        data: { items: [], total: 0, page: 1, limit: 50, totalPages: 0 },
      });
    }

    // Hiring Pipeline is based on CRM candidates added from the Candidates page.
    // Recruiters must not see another recruiter's candidate cards even when they
    // share the same assigned job.
    filter.crmCandidateId = { $in: ownedCandidateIds };
    delete filter.$or;
  }

  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(query.limit ?? '50', 10)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('jobId', 'title')
      .populate('candidateId', 'name email')
      .lean(),
    Application.countDocuments(filter),
  ]);

  const userCandidateIds = [...new Set(items
    .filter((i) => i.candidateId)
    .map((i) => {
      const c = i.candidateId as unknown;
      if (c && typeof c === 'object' && '_id' in c) return (c as { _id: mongoose.Types.ObjectId })._id.toString();
      if (c && typeof c === 'object' && 'toString' in c) return (c as mongoose.Types.ObjectId).toString();
      return null;
    })
    .filter(Boolean) as string[])];
  const profiles = await CandidateProfile.find({ userId: { $in: userCandidateIds.map((id) => new mongoose.Types.ObjectId(id)) } })
    .select('userId resumePath')
    .lean();
  const profileByUser = Object.fromEntries(profiles.map((p) => [p.userId.toString(), p.resumePath ?? null]));

  const crmIds = [...new Set(items
    .filter((i) => i.crmCandidateId)
    .map((i) => (i as { crmCandidateId?: mongoose.Types.ObjectId }).crmCandidateId)
    .filter(Boolean) as mongoose.Types.ObjectId[])];
  const crmCandidates = await Candidate.find({ _id: { $in: crmIds } })
    .select('name email')
    .lean();
  const crmById = Object.fromEntries(
    crmCandidates.map((c) => {
      const doc = c as { _id: mongoose.Types.ObjectId; name?: string; email?: string };
      return [
        doc._id.toString(),
        { name: (doc.name ?? 'Unknown').trim() || 'Unknown', email: doc.email ?? '' },
      ];
    })
  );

  // Pre-fetch all unknown candidateId emails to avoid N+1 lookups
  const unknownEmailCandidates = items
    .filter((i) => !i.crmCandidateId && i.candidateId)
    .map((i) => {
      const c = i.candidateId as unknown as { _id?: mongoose.Types.ObjectId; name?: string; email?: string } | null;
      return c && (!c.name || c.name.trim() === 'Unknown') && c.email ? c.email : null;
    })
    .filter(Boolean) as string[];
  const emailFallbackCandidates = unknownEmailCandidates.length > 0
    ? await Candidate.find({ email: { $in: unknownEmailCandidates } }).select('name email').lean()
    : [];
  const nameByEmail = Object.fromEntries(
    emailFallbackCandidates.map((c) => [((c as { email?: string }).email ?? '').toLowerCase(), ((c as { name?: string }).name ?? '').trim()])
  );

  const data: ReturnType<typeof toAppItem>[] = [];
  for (const i of items) {
    const app = i as IApplication & { createdAt: Date; updatedAt: Date; crmCandidateId?: mongoose.Types.ObjectId };
    const job = i.jobId as unknown as { _id: mongoose.Types.ObjectId; title: string } | null;
    let candidate: { name: string; email: string } | null = null;
    let resumeUrl: string | null = null;
    if (app.crmCandidateId) {
      const crm = crmById[app.crmCandidateId.toString()];
      candidate = crm ? { name: crm.name, email: crm.email } : { name: 'Unknown', email: '' };
    } else {
      const cand = i.candidateId as unknown as { _id: mongoose.Types.ObjectId; name?: string; email?: string } | null;
      if (cand && typeof cand === 'object') {
        let name = (cand.name ?? '').trim() || 'Unknown';
        if (name === 'Unknown' && cand.email) {
          name = nameByEmail[cand.email.toLowerCase()] || name;
        }
        candidate = { name, email: cand.email ?? '' };
        resumeUrl = cand._id ? profileByUser[cand._id.toString()] ?? null : null;
      }
    }
    data.push(
      toAppItem(
        app,
        candidate,
        job && typeof job === 'object' && 'title' in job ? { title: job.title } : null,
        resumeUrl
      )
    );
  }

  res.json({
    success: true,
    data: {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/** PATCH update application stage (staff only). Recruiter: only for their jobs. */
export const updateStage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { stage } = req.body as { stage: ApplicationStatus };
  const role = req.user?.role;
  const userId = req.user?.userId;
  if (!PIPELINE_STAGES.includes(stage)) {
    throw new AppError(400, 'Invalid stage');
  }

  const existing = await Application.findById(id).select('jobId crmCandidateId').lean();
  if (!existing) throw new AppError(404, 'Application not found');
  if (role === 'recruiter' && userId) {
    const recruiterJobIds = await getRecruiterJobIds(userId);
    const jobIdStr = (existing.jobId as unknown as mongoose.Types.ObjectId)?.toString();
    if (!recruiterJobIds.some((jid) => jid.toString() === jobIdStr)) {
      throw new AppError(403, 'You can only update applications for jobs assigned to you');
    }
    const crmCandidateId = (existing as { crmCandidateId?: mongoose.Types.ObjectId | null }).crmCandidateId;
    if (!crmCandidateId) {
      throw new AppError(403, 'You can only update your own CRM candidate applications');
    }
    const ownedCandidate = await Candidate.findOne({
      _id: crmCandidateId,
      recruiterId: new mongoose.Types.ObjectId(userId),
      $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }, { isBlocked: null }],
    })
      .select('_id')
      .lean();
    if (!ownedCandidate) {
      throw new AppError(403, 'You can only update your own candidate pipeline');
    }
  }

  const app = await Application.findByIdAndUpdate(
    id,
    { status: stage },
    { new: true }
  )
    .populate('jobId', 'title')
    .populate('candidateId', 'name email')
    .lean();

  if (!app) throw new AppError(404, 'Application not found');

  const cand = app.candidateId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string } | null;
  let resumeUrl: string | null = null;
  if (cand && typeof cand === 'object' && cand._id) {
    const profile = await CandidateProfile.findOne({ userId: cand._id }).select('resumePath').lean();
    resumeUrl = profile?.resumePath ?? null;
  }
  const jobRef = app.jobId as unknown as { title: string } | null;

  res.json({
    success: true,
    data: toAppItem(
      app as IApplication & { createdAt: Date; updatedAt: Date },
      cand && typeof cand === 'object' && 'name' in cand ? { name: cand.name, email: cand.email } : null,
      jobRef && 'title' in jobRef ? { title: jobRef.title } : null,
      resumeUrl
    ),
  });
});

/** GET resume for an application (staff only; recruiter must have job assigned). Serves file or redirects to Cloudinary. CRM candidates have no resume. */
export const getApplicationResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const applicationId = req.params.id;
  const app = await Application.findById(applicationId)
    .select('jobId candidateId crmCandidateId')
    .lean();
  if (!app) throw new AppError(404, 'Application not found');

  const jobId = app.jobId as unknown as mongoose.Types.ObjectId;
  const job = await Job.findById(jobId).select('recruiterAssignments').lean() as {
    recruiterAssignments?: { recruiterId: mongoose.Types.ObjectId; status: string }[];
  };
  if (!job) throw new AppError(404, 'Job not found');

  const role = req.user?.role;
  const userId = req.user?.userId;
  if (role !== 'admin') {
    const hasAcceptedJob = (job.recruiterAssignments || []).some(
      (assignment) => assignment.recruiterId.toString() === userId && assignment.status === 'accepted'
    );
    if (!hasAcceptedJob) {
      throw new AppError(403, 'You do not have access to this application');
    }

    const appWithCrm = app as { crmCandidateId?: mongoose.Types.ObjectId | null };
    if (!appWithCrm.crmCandidateId) {
      throw new AppError(403, 'You can only access your own CRM candidate applications');
    }
    const ownedCandidate = await Candidate.findOne({
      _id: appWithCrm.crmCandidateId,
      recruiterId: new mongoose.Types.ObjectId(userId),
      $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }, { isBlocked: null }],
    })
      .select('_id')
      .lean();
    if (!ownedCandidate) {
      throw new AppError(403, 'You can only access your own candidate applications');
    }
  }

  const appWithCrm = app as { crmCandidateId?: mongoose.Types.ObjectId };
  if (appWithCrm.crmCandidateId) {
    throw new AppError(404, 'No resume uploaded for this candidate');
  }

  const candidateId = app.candidateId as unknown as mongoose.Types.ObjectId;
  if (!candidateId) throw new AppError(404, 'No resume uploaded for this candidate');

  const profile = await CandidateProfile.findOne({ userId: candidateId }).select('resumePath').lean();
  if (!profile?.resumePath) {
    throw new AppError(404, 'No resume uploaded for this candidate');
  }

  if (profile.resumePath.startsWith('http://') || profile.resumePath.startsWith('https://')) {
    res.redirect(302, profile.resumePath);
    return;
  }
  const absolutePath = path.join(process.cwd(), 'uploads', profile.resumePath);
  if (!fs.existsSync(absolutePath)) {
    throw new AppError(404, 'Resume file not found');
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(absolutePath);
});
