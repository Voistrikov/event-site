import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

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
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
