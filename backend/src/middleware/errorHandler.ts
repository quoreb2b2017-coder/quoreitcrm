import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    } satisfies ErrorResponse);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors: Record<string, string[]> = {};
    for (const [path, obj] of Object.entries((err as { errors?: Record<string, { message: string }> }).errors ?? {})) {
      errors[path] = [(obj as { message: string }).message];
    }
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    } satisfies ErrorResponse);
    return;
  }

  // Mongoose duplicate key
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Resource already exists',
    } satisfies ErrorResponse);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    } satisfies ErrorResponse);
    return;
  }

  const statusCode = 500;
  const response: ErrorResponse = {
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  };

  if (config.nodeEnv !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
