import { z } from 'zod';

const optionalUrl = z.union([z.string().url(), z.literal('')]).optional();

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120).trim(),
  email: z.string().email('Invalid email').toLowerCase().trim(),
  phone: z.string().max(30).trim().optional(),
  linkedInUrl: optionalUrl,
  githubUrl: optionalUrl,
  projectId: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  jobId: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  status: z.string().max(60).trim().optional(),
  location: z.string().max(100).trim().optional(),
  tags: z.array(z.string()).optional(),
  fundingRound: z.string().max(60).trim().optional(),
  likelinessToRespond: z.string().max(60).trim().optional(),
  experiences: z.array(z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  resumeUrl: z.string().url().optional().nullable(),
  resumePublicId: z.string().optional().nullable(),
  resumeText: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const updateCandidateSchema = z.object({
  name: z.string().min(1).max(120).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().max(30).trim().optional(),
  linkedInUrl: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  projectId: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  jobId: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  status: z.string().max(60).trim().optional(),
  location: z.string().max(100).trim().optional(),
  tags: z.array(z.string()).optional(),
  fundingRound: z.string().max(60).trim().optional(),
  talentDensity: z.string().max(60).trim().optional(),
  likelinessToRespond: z.string().max(60).trim().optional(),
  /** Block candidate – only admin can set; when true, recruiters cannot see this candidate */
  isBlocked: z.boolean().optional(),
  /** Set after uploading via /upload/profile-photo – optional */
  avatar: z.string().url().optional().nullable(),
  avatarPublicId: z.string().optional().nullable(),
  experiences: z.array(z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  activities: z.array(z.object({
    type: z.string().min(1),
    description: z.string().min(1),
    date: z.any().optional(), // Can refine to z.date() if preferred
  })).optional(),
  internalNotes: z.array(z.object({
    id: z.number(),
    text: z.string(),
    date: z.string(),
    createdAt: z.number(),
  })).optional(),
  resumeUrl: z.string().url().optional().nullable(),
  resumePublicId: z.string().optional().nullable(),
  resumeText: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
