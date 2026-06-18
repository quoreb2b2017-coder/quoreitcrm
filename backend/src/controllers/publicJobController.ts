import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { uploadByType } from '../services/uploadService.js';

type JobLean = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  skills: string[];
  salary: string;
  location: string;
  requirements: string[];
  benefits: string[];
  customFields: { name: string; value: string }[];
  personalQuestions: { question: string; required: boolean }[];
  workplaceType?: string;
  roleType?: string;
  companyName?: string;
  companyLogo?: string;
  idealCandidate?: { experience?: string; seniority?: string; education?: string };
  createdAt: Date;
  updatedAt: Date;
};

/** Public API — never expose companyName / companyLogo */
function toPublicJob(job: JobLean) {
  const custom = job.customFields ?? [];
  const getField = (name: string) =>
    custom.find((f) => f.name.toLowerCase() === name.toLowerCase())?.value ?? '';

  return {
    _id: job._id.toString(),
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    skills: job.skills ?? [],
    salary: job.salary ?? '',
    location: job.location ?? '',
    requirements: job.requirements ?? [],
    niceToHave: job.benefits ?? [],
    customFields: custom,
    personalQuestions: job.personalQuestions ?? [],
    jobType: job.roleType || job.workplaceType || 'Full-time',
    workplaceType: job.workplaceType ?? '',
    roleType: job.roleType ?? '',
    experience: job.idealCandidate?.experience ?? '',
    seniority: job.idealCandidate?.seniority ?? '',
    visa: getField('Visa'),
    reportsTo: getField('Reports To'),
    interviewProcess: getField('Interview Process'),
    whatYoullDo: getField("What You'll Do"),
    notAFit: getField('Not a Fit')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    postedBy: 'Quore IT',
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

/** GET /public/jobs — published jobs for public website */
export const listPublicJobs = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const jobs = await Job.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .lean();
  res.json((jobs as unknown as JobLean[]).map(toPublicJob));
});

/** GET /public/jobs/:id — single published job */
export const getPublicJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findOne({ _id: req.params.id, status: 'published' }).lean();
  if (!job) throw new AppError(404, 'Job not found');
  res.json(toPublicJob(job as unknown as JobLean));
});

/** POST /public/applications/apply — public job application with resume */
export const publicApply = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId, firstName, lastName, email, phone, coverLetter, questionAnswers: questionAnswersRaw } = req.body as {
    jobId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    coverLetter?: string;
    questionAnswers?: string;
  };

  let questionAnswers: { question: string; answer: string }[] = [];
  if (questionAnswersRaw) {
    try {
      const parsed = JSON.parse(questionAnswersRaw) as { question: string; answer: string }[];
      if (Array.isArray(parsed)) questionAnswers = parsed;
    } catch {
      /* ignore invalid JSON */
    }
  }

  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError(400, 'Valid jobId is required');
  }
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    throw new AppError(400, 'First name, last name, and email are required');
  }

  const job = await Job.findOne({ _id: jobId, status: 'published' }).select('title').lean();
  if (!job) throw new AppError(404, 'Job not found or not accepting applications');

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await Application.findOne({
    jobId: new mongoose.Types.ObjectId(jobId),
    source: 'public',
    email: normalizedEmail,
  }).select('_id').lean();
  if (existing) throw new AppError(409, "You've already applied for this job.");

  let resumeUrl = '';
  const file = req.file;
  if (file?.buffer) {
    try {
      const uploaded = await uploadByType(file.buffer, 'resume', { originalname: file.originalname });
      resumeUrl = uploaded.secureUrl;
    } catch {
      // Save application even if Cloudinary upload fails
    }
  }

  const application = await Application.create({
    jobId,
    source: 'public',
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: phone?.trim() ?? '',
    coverLetter: coverLetter?.trim() ?? '',
    questionAnswers,
    resumeUrl,
    status: 'applied',
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      id: application._id.toString(),
      jobId,
      jobTitle: (job as { title?: string }).title ?? '',
    },
  });
});
