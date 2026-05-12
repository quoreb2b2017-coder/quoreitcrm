import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Tag } from '../models/Tag.js';
import type { ITag } from '../models/Tag.js';
import type { CreateTagInput } from '../validations/activitySchemas.js';

function toTagResponse(tag: ITag & { createdAt: Date; updatedAt: Date }) {
  return {
    id: tag._id.toString(),
    name: tag.name,
    color: tag.color ?? '#6b7280',
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const tags = await Tag.find().sort({ name: 1 }).lean();
  res.json({
    success: true,
    data: tags.map((t) => toTagResponse(t as ITag & { createdAt: Date; updatedAt: Date })),
  });
});

export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateTagInput;
  if (!req.user) throw new AppError(401, 'Authentication required');
  const role = req.user.role;
  const STAFF: readonly string[] = ['admin', 'recruiter'];
  if (!STAFF.includes(role)) {
    throw new AppError(403, 'Only recruiters or admins can create tags');
  }

  const existing = await Tag.findOne({ name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') } });
  if (existing) throw new AppError(409, 'A tag with this name already exists');

  const tag = await Tag.create({
    name: body.name.trim(),
    color: body.color ?? '#6b7280',
  });

  res.status(201).json({
    success: true,
    data: toTagResponse(tag as ITag & { createdAt: Date; updatedAt: Date }),
  });
});

export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tagId = req.params.tagId;
  if (!req.user) throw new AppError(401, 'Authentication required');
  const role = req.user.role;
  const STAFF: readonly string[] = ['admin', 'recruiter'];
  if (!STAFF.includes(role)) throw new AppError(403, 'Only recruiters or admins can delete tags');

  const tag = await Tag.findByIdAndDelete(tagId);
  if (!tag) throw new AppError(404, 'Tag not found');
  res.json({ success: true, data: { message: 'Tag deleted' } });
});
