import { z } from 'zod';

/** API status: open (accepting applications) | closed */
export const jobStatusApiEnum = z.enum(['open', 'closed']);
export type JobStatusApi = z.infer<typeof jobStatusApiEnum>;

/** DB stores: published (open), closed. We map open <-> published. */
export const STATUS_OPEN_DB = 'published';
export const STATUS_CLOSED_DB = 'closed';

export function apiStatusToDb(api: 'open' | 'closed'): 'published' | 'closed' {
  return api === 'open' ? STATUS_OPEN_DB : STATUS_CLOSED_DB;
}

export function dbStatusToApi(db: string): 'open' | 'closed' {
  return db === STATUS_CLOSED_DB ? 'closed' : 'open';
}

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(10000).default(''),
  skills: z.array(z.string().max(100)).max(50).default([]),
  salary: z.string().max(120).default(''),
  location: z.string().max(200).default(''),
  requirements: z.array(z.string().max(1000)).max(50).default([]),
  customFields: z.array(z.object({
    name: z.string().max(100).trim(),
    value: z.string().max(2000).trim(),
  })).max(50).default([]),
  recruiterIds: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).default([]).optional(),
  status: jobStatusApiEnum.default('open'),
  benefits: z.array(z.string().max(200)).max(50).default([]),
  personalQuestions: z.array(z.object({
    question: z.string().min(1).max(500).trim(),
    required: z.boolean().default(false),
  })).max(20).default([]),
  workplaceType: z.string().max(100).default(''),
  roleType: z.string().max(100).default(''),
  companyName: z.string().max(200).trim().optional(),
  companyLogo: z.string().max(1000).trim().optional(),
  openings: z.number().min(1).max(1000).default(1),
});

export const updateJobSchema = createJobSchema.partial();

export const assignRecruitersSchema = z.object({
  recruiterIds: z.array(z.string().regex(/^[a-f0-9]{24}$/i)),
});

/** List jobs query – permissive so empty/invalid optional params never cause 400 */
export const listJobsQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
      return Number.isNaN(n) || n < 1 ? 1 : Math.min(n, 9999);
    }),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
      return Number.isNaN(n) || n < 1 ? 10 : Math.min(Math.max(n, 1), 500);
    }),
  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      const s = Array.isArray(v) ? v[0] : v;
      return s === 'open' || s === 'closed' ? s : undefined;
    }),
  recruiterId: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      const s = (Array.isArray(v) ? v[0] : v) ?? '';
      return typeof s === 'string' && s.trim() ? s.trim() : undefined;
    }),
  search: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      const s = (Array.isArray(v) ? v[0] : v) ?? '';
      return typeof s === 'string' && s.length > 0 ? s.slice(0, 200) : undefined;
    }),
  /** When true, return all jobs (for Role dropdown); recruiters see every job so they can tag any role */
  forRoleDropdown: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true' || v === '1'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type AssignRecruitersInput = z.infer<typeof assignRecruitersSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
