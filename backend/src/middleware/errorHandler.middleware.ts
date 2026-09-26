import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.util.js';
import { AppError } from '../utils/appError.js';
import multer from 'multer';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller.'
      : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'A maximum of 3 event photos is allowed.'
        : 'Invalid upload.';
    sendError(res, 400, message, 'VALIDATION_ERROR');
    return;
  }

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
      const meta = (err as Record<string, unknown>)['meta'];
      const metaStr = JSON.stringify(meta || {});

      if (metaStr.includes('username')) {
        sendError(res, 409, 'user account exists', 'USERNAME_TAKEN');
        return;
      }
      if (metaStr.includes('email')) {
        sendError(res, 409, 'user account mail exists', 'EMAIL_TAKEN');
        return;
      }

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
