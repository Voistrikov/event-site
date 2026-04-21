import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, dateFrom } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && typeof category === 'string') {
      where.eventType = { equals: category, mode: 'insensitive' };
    }

    if (dateFrom && typeof dateFrom === 'string') {
      where.startDateTime = { gte: new Date(dateFrom) };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ticketTypes: true,
        photos: true,
      }
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
};
