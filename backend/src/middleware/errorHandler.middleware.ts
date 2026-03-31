import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.util.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed.',
      code: 'VALIDATION_ERROR',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err != null && typeof err === 'object' && 'code' in err) {
    const code = (err as Record<string, unknown>)['code'];
    if (code === 'P2002') {
      sendError(res, 409, 'A record with that value already exists.', 'CONFLICT');
      return;
    }
    if (code === 'P2025') {
      sendError(res, 404, 'Record not found.', 'NOT_FOUND');
      return;
    }
  }

  logger.error({ err }, 'Unhandled error');
  sendError(res, 500, 'An unexpected error occurred.', 'INTERNAL_SERVER_ERROR');
}
