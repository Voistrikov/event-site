import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, dateFrom, rooms, beds, lat, lng, maxPrice, organizerId } = req.query;

    const where: any = {};

    if (organizerId && typeof organizerId === 'string') {
      where.organizerId = organizerId;
    }

    if (maxPrice) {
      where.ticketTypes = {
        some: {
          price: { lte: Number(maxPrice) }
        }
      };
    }

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

    let requiredCapacity = 0;
    if (rooms) requiredCapacity = Math.max(requiredCapacity, Number(rooms) * 2);
    if (beds) requiredCapacity = Math.max(requiredCapacity, Number(beds));
    
    if (requiredCapacity > 0) {
      where.capacity = { gte: requiredCapacity };
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    if (lat && lng) {
      const targetLat = Number(lat);
      const targetLng = Number(lng);
      
      const allEvents = await prisma.event.findMany({
        where,
        include: { ticketTypes: true, photos: true }
      });

      allEvents.sort((a, b) => {
        const distA = a.latitude && a.longitude ? getDistance(targetLat, targetLng, a.latitude, a.longitude) : Infinity;
        const distB = b.latitude && b.longitude ? getDistance(targetLat, targetLng, b.latitude, b.longitude) : Infinity;
        return distA - distB;
      });

      const paginatedEvents = allEvents.slice(skip, skip + limit);
      
      res.json({
        events: paginatedEvents,
        totalPages: Math.ceil(allEvents.length / limit)
      });
      return;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          ticketTypes: true,
          photos: true,
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

import { getRecommendations } from '../services/recommendation.service.js';

export const getRecommendedEventsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Determine userId from req.user (if authenticated)
    const userId = (req as any).user?.id; // Assuming authenticate middleware sets req.user
    
    const recommendations = await getRecommendations(userId);
    res.json({ events: recommendations });
  } catch (error) {
    next(error);
  }
};
