import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Project } from '../models/Project.js';
import type { CreateProjectInput } from '../validations/projectSchemas.js';

function toProjectResponse(p: { _id: mongoose.Types.ObjectId; name: string; recruiterId: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }) {
  return {
    id: p._id.toString(),
    name: p.name,
    recruiterId: p.recruiterId.toString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** List projects: recruiter = own, admin = all */
export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  const filter = role === 'admin' ? {} : { recruiterId: new mongoose.Types.ObjectId(userId) };

  // Use aggregation to get project data and candidate count
  const projects = await Project.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'candidates',
        localField: '_id',
        foreignField: 'projectId',
        as: 'candidates',
      },
    },
    {
      $project: {
        id: { $toString: '$_id' },
        name: 1,
        recruiterId: { $toString: '$recruiterId' },
        createdAt: 1,
        updatedAt: 1,
        candidateCount: { $size: '$candidates' },
      },
    },
    { $sort: { name: 1 } },
  ]);

  res.json({
    success: true,
    data: projects,
  });
});

/** Create project (role name e.g. AI/ML Engineer). Recruiter creates for self; admin can create for any recruiter if needed – we keep it simple: creator = owner. */
export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateProjectInput;
  const userId = req.user?.userId;
  if (!userId) throw new AppError(401, 'Authentication required');

  const name = body.name.trim();
  const existing = await Project.findOne({
    recruiterId: new mongoose.Types.ObjectId(userId),
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (existing) throw new AppError(409, 'A project with this name already exists for you');

  const project = await Project.create({
    name,
    recruiterId: new mongoose.Types.ObjectId(userId),
  });
  res.status(201).json({
    success: true,
    data: toProjectResponse(project),
  });
});

/** Delete project: Recruiter can delete only own. Admin can delete any. */
export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!id || !userId) throw new AppError(400, 'Invalid request');

  const project = await Project.findById(id);
  if (!project) throw new AppError(404, 'Project not found');

  if (role !== 'admin' && project.recruiterId.toString() !== userId) {
    throw new AppError(403, 'You can only delete your own projects');
  }

  await project.deleteOne();

  res.json({
    success: true,
    data: toProjectResponse(project as unknown as { _id: mongoose.Types.ObjectId; name: string; recruiterId: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }),
  });
});
