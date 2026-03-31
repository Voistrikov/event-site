import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service.js';
import { sendError, sendPaginated } from '../utils/response.util.js';

const listUsersQuerySchema = z.object({
  role:   z.enum(['ATTENDEE', 'ORGANIZER', 'ADMIN']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
});

const updateStatusBodySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const { users, total } = await adminService.listUsers(query);
    sendPaginated(res, users, total, query.page, query.limit);
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { status } = updateStatusBodySchema.parse(req.body);
    const user = await adminService.updateUserStatus(id, status);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
