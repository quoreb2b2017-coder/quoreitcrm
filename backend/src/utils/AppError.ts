export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    isOperational = true,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    (this as { isOperational?: boolean }).isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(statusCode: number, message: string): AppError {
  return new AppError(statusCode, message);
}
