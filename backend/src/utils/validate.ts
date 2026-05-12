import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';
import { AppError } from './AppError.js';

function zodErrorsToRecord(error: { issues: Array<{ path: (string | number)[]; message: string }> }): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_';
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return errors;
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, 'Validation failed', true, zodErrorsToRecord(result.error));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new AppError(400, 'Validation failed', true, zodErrorsToRecord(result.error));
    }
    req.query = result.data as Request['query'];
    next();
  };
}
