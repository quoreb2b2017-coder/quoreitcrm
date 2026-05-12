import { z } from 'zod';

const passwordMin = 8;
const passwordMax = 128;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(passwordMin, `Password must be at least ${passwordMin} characters`)
    .max(passwordMax, `Password must be at most ${passwordMax} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(120, 'Name too long').trim(),
  // Public signup cannot set admin; use seed or admin invite in production
  role: z.enum(['recruiter']).optional(),
});

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name too long').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(passwordMin, `Password must be at least ${passwordMin} characters`)
    .max(passwordMax, `Password must be at most ${passwordMax} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const createUserSchema = createCandidateSchema.extend({
  role: z.enum(['admin', 'recruiter']),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name too long').trim().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  company: z.string().max(200).trim().optional().or(z.literal('')),
  bio: z.string().max(5000).trim().optional().or(z.literal('')),
  introVideoUrl: z.string().url().optional().or(z.literal('')),
  phoneNumbers: z.array(z.string().max(30).trim()).optional(),
  phoneConnected: z.boolean().optional(),
  googleConnected: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
