import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { sendError } from '../utils/response.util.js';

function userId(req: Request): string {
  return (req as AuthenticatedRequest).user.id;
}

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = userId(req);
    const { recipientId, recipientUsername, username, subject, body } = req.body;
    const recipientKey = String(recipientId || recipientUsername || username || '').trim();

    if (!recipientKey || !subject || !body) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const cleanUsername = recipientKey.startsWith('@') ? recipientKey.slice(1).trim() : recipientKey;

    // Find recipient by ID first or by username (case-insensitive)
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { id: recipientKey },
          { username: { equals: recipientKey, mode: 'insensitive' } },
          { username: { equals: cleanUsername, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true },
    });

    if (!recipient) {
      res.status(404).json({ error: 'Ο παραλήπτης δεν βρέθηκε (Recipient not found).' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: recipient.id,
        subject: String(subject).trim(),
        body: String(body).trim(),
      },
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = userId(req);
    const messages = await prisma.message.findMany({
      where: { recipientId: currentUserId, deletedByRecipient: false },
      include: {
        sender: { select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getSent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = userId(req);
    const messages = await prisma.message.findMany({
      where: { senderId: currentUserId, deletedBySender: false },
      include: {
        recipient: { select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unreadCount = await prisma.message.count({
      where: { recipientId: userId(req), read: false, deletedByRecipient: false },
    });
    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.message.updateMany({
      where: { id: String(req.params['id']), recipientId: userId(req), deletedByRecipient: false },
      data: { read: true },
    });
    if (result.count === 0) {
      sendError(res, 404, 'Message not found.', 'MESSAGE_NOT_FOUND');
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const deleteInboxMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.message.updateMany({
      where: { id: String(req.params['id']), recipientId: userId(req), deletedByRecipient: false },
      data: { deletedByRecipient: true },
    });
    if (result.count === 0) {
      sendError(res, 404, 'Message not found.', 'MESSAGE_NOT_FOUND');
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const deleteSentMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.message.updateMany({
      where: { id: String(req.params['id']), senderId: userId(req), deletedBySender: false },
      data: { deletedBySender: true },
    });
    if (result.count === 0) {
      sendError(res, 404, 'Message not found.', 'MESSAGE_NOT_FOUND');
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
