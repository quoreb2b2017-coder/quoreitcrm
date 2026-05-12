import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { Job } from '../models/Job.js';
import type { UserRole } from '@ats-saas/shared';

/** RBAC roles: admin (all access), recruiter (assigned jobs only) */
export const RBAC_ROLES = ['admin', 'recruiter'] as const;

/**
 * Restrict route to given roles. Must be used after authMiddleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'You do not have permission to access this resource');
    }
    next();
  };
}

/** Admin only – full access */
export const requireAdmin = requireRole('admin');

/** Recruiter or admin (staff that can see jobs) */
export const requireRecruiter = requireRole('admin', 'recruiter');

/** Staff: admin, recruiter – for listing jobs */
export const requireStaff = requireRole('admin', 'recruiter');

/**
 * Recruiter can only access jobs assigned to them; admin can access all.
 * Must be used after authMiddleware. Expects req.params.id to be the job id.
 * Compatible with express-async-errors.
 */
export async function requireJobAssignment(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }
  if (req.user.role === 'admin') {
    next();
    return;
  }
  const job = await Job.findById(req.params.id).select('recruiterIds status').lean() as { recruiterIds?: any[] };
  if (!job) {
    throw new AppError(404, 'Job not found');
  }
  if (req.user.role !== 'recruiter') {
    throw new AppError(403, 'Only recruiters or admins can access this job');
  }

  const recs = Array.isArray(job.recruiterIds) ? job.recruiterIds : [];
  const recIds = recs.map(r => r?.toString?.() ?? String(r));

  if (!recIds.includes(req.user.userId)) {
    throw new AppError(403, 'You can only access jobs assigned to you');
  }
  next();
}

/**
 * Ensures user can only access the profile identified by param (own profile for recruiter; admin can access any).
 * @param paramKey - req.params key for user id (default 'id')
 */
export function requireOwnProfile(paramKey = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    const targetId = req.params[paramKey];
    if (!targetId) {
      throw new AppError(400, 'User id is required');
    }
    if (req.user.role === 'admin') {
      next();
      return;
    }
    if (targetId !== req.user.userId) {
      throw new AppError(403, 'You can only access your own profile');
    }
    next();
  };
}
