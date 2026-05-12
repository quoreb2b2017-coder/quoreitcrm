import { z } from 'zod';

const experienceItemSchema = z.object({
  company: z.string().min(1, 'Company is required').max(200).trim(),
  role: z.string().min(1, 'Role is required').max(200).trim(),
  startDate: z.string().max(50).trim(),
  endDate: z.string().max(50).trim(),
  description: z.string().max(2000).trim().optional(),
});

const educationItemSchema = z.object({
  school: z.string().min(1, 'School is required').max(200).trim(),
  degree: z.string().min(1, 'Degree is required').max(120).trim(),
  field: z.string().min(1, 'Field is required').max(120).trim(),
  startDate: z.string().max(50).trim(),
  endDate: z.string().max(50).trim(),
});

export const updateCandidateProfileSchema = z.object({
  phone: z.string().max(50).trim().optional(),
  headline: z.string().max(200).trim().optional(),
  summary: z.string().max(5000).trim().optional(),
  skills: z.array(z.string().max(100).trim()).max(100).optional(),
  experience: z.array(experienceItemSchema).max(50).optional(),
  education: z.array(educationItemSchema).max(30).optional(),
});

export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;
