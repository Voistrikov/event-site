import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../utils/appError.js';

const userSelect = { id: true, username: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true } as const;

async function removeStoredAvatar(avatarUrl: string | null): Promise<void> {
  if (!avatarUrl?.startsWith('/uploads/avatars/')) return;
  await fs.unlink(path.resolve(process.cwd(), 'uploads', 'avatars', path.basename(avatarUrl))).catch(() => undefined);
}

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'VALIDATION_ERROR', 'An avatar image is required.');
    const userId = (req as any).user.id as string;
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (!current) throw new AppError(404, 'NOT_FOUND', 'User not found.');
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({ where: { id: userId }, data: { avatarUrl }, select: userSelect });
    await removeStoredAvatar(current.avatarUrl);
    res.json({ user });
  } catch (error) { next(error); }
};

export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id as string;
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (!current) throw new AppError(404, 'NOT_FOUND', 'User not found.');
    const user = await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null }, select: userSelect });
    await removeStoredAvatar(current.avatarUrl);
    res.json({ user });
  } catch (error) { next(error); }
};

export const upgradeToOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      res.status(400).json({ error: 'User is already an organizer or admin' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ORGANIZER' },
      select: userSelect
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
