import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

export const createNoteSchema = z.object({
  candidateId: objectId,
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  tags: z.array(objectId).optional(),
  isPinned: z.boolean().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  tags: z.array(objectId).optional(),
  isPinned: z.boolean().optional(),
});
export const createCallSchema = z.object({
  candidateId: objectId,
  type: z.enum(['incoming', 'outgoing']),
  duration: z.number().min(0),
  outcome: z.enum(['Interested', 'Not Answered', 'Call Back Later', 'Rejected']),
  notes: z.string().max(2000).trim().optional(),
  addToCalendar: z.boolean().optional(),
  createMeetLink: z.boolean().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

export const updateCallSchema = z.object({
  duration: z.number().min(0).optional(),
  outcome: z.enum(['Interested', 'Not Answered', 'Call Back Later', 'Rejected']).optional(),
  notes: z.string().max(2000).trim().optional(),
  addToCalendar: z.boolean().optional(),
  createMeetLink: z.boolean().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50).trim(),
  color: z.string().min(1).max(20).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateCallInput = z.infer<typeof createCallSchema>;
export type UpdateCallInput = z.infer<typeof updateCallSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
