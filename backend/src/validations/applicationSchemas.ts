import { z } from 'zod';

export const applyJobSchema = z.object({
  jobId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid job id'),
});

export const addToPipelineSchema = z.object({
  jobId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid job id'),
  crmCandidateId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid candidate id'),
});

export const updateStageSchema = z.object({
  stage: z.enum(['applied', 'screening', 'interview', 'offered', 'hired', 'rejected']),
});

export const listApplicationsQuerySchema = z.object({
  jobId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  candidateId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  stage: z.enum(['applied', 'screening', 'interview', 'offered', 'hired', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
