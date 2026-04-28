import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.id;
    const { recipientId, subject, body } = req.body;

    if (!recipientId || !subject || !body) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        subject,
        body
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const messages = await prisma.message.findMany({
      where: { recipientId: userId },
      include: {
        sender: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getSent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const messages = await prisma.message.findMany({
      where: { senderId: userId },
      include: {
        recipient: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
