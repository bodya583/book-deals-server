import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. Domain App Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
      details: err.details,
    });
  }

  // 2. Zod Request Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));

    return res.status(400).json({
      message: formattedErrors[0]?.message || 'Validation error',
      errorCode: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
  }

  // 3. Fallback generic or unexpected server errors
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[UnhandledError]', err);

  return res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    errorCode: 'INTERNAL_SERVER_ERROR',
  });
};
