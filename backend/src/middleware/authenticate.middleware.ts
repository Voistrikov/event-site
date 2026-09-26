import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util.js';
import { sendError } from '../utils/response.util.js';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

/**
 * Verifies the Bearer access token in the Authorization header.
 * Re-fetches the user from the DB so the attached status is always current.
 * On success attaches `req.user = { id, role, status }` and calls next().
 * On failure responds 401 directly — never passes an error to next().
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 401, 'Missing or malformed Authorization header.', 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    sendError(res, 401, 'Invalid or expired access token.', 'INVALID_TOKEN');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, status: true },
  });

  if (!user) {
    sendError(res, 401, 'User not found.', 'UNAUTHORIZED');
    return;
  }

  (req as AuthenticatedRequest).user = user;
  next();
}

export async function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, status: true },
  });

  if (user) {
    (req as AuthenticatedRequest).user = user;
  }
  next();
}
