import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { AppError } from '../utils/appError.js';
import { sendError } from '../utils/response.util.js';

function currentUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    const eventId = body['eventId'];
    const ticketTypeId = body['ticketTypeId'];
    // `quantity` remains a compatibility alias while clients migrate.
    const numberOfTickets = body['numberOfTickets'] ?? body['quantity'];

    if (
      typeof eventId !== 'string'
      || typeof ticketTypeId !== 'string'
      || !Number.isInteger(numberOfTickets)
      || (numberOfTickets as number) < 1
    ) {
      sendError(res, 400, 'eventId, ticketTypeId and a positive integer numberOfTickets are required.', 'VALIDATION_ERROR');
      return;
    }

    const userId = currentUser(req).id;
    const ticketCount = numberOfTickets as number;
    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
      if (event.status !== 'PUBLISHED') throw new AppError(400, 'EVENT_NOT_BOOKABLE', 'Only published events accept bookings.');
      if (event.startDateTime <= new Date()) throw new AppError(400, 'EVENT_ALREADY_STARTED', 'The event has already started.');
      if (event.organizerId === userId) throw new AppError(400, 'CANNOT_BOOK_OWN_EVENT', 'You cannot book your own event.');

      const ticketType = await tx.ticketType.findUnique({ where: { id: ticketTypeId } });
      if (!ticketType || ticketType.eventId !== eventId) {
        throw new AppError(404, 'TICKET_TYPE_NOT_FOUND', 'Ticket type not found for this event.');
      }
      if (ticketType.available < ticketCount) {
        throw new AppError(400, 'INSUFFICIENT_TICKETS', 'Not enough tickets are available.');
      }

      const booked = await tx.booking.aggregate({
        where: { eventId, status: { in: ['PENDING', 'CONFIRMED'] } },
        _sum: { numberOfTickets: true },
      });
      if ((booked._sum.numberOfTickets ?? 0) + ticketCount > event.capacity) {
        throw new AppError(400, 'EVENT_CAPACITY_EXCEEDED', 'The event does not have enough remaining capacity.');
      }

      const updated = await tx.ticketType.updateMany({
        where: { id: ticketTypeId, eventId, available: { gte: ticketCount } },
        data: { available: { decrement: ticketCount } },
      });
      if (updated.count !== 1) {
        throw new AppError(400, 'INSUFFICIENT_TICKETS', 'Not enough tickets are available.');
      }

      return tx.booking.create({
        data: {
          eventId,
          userId,
          ticketTypeId,
          numberOfTickets: ticketCount,
          totalCost: ticketType.price.mul(ticketCount),
          status: 'CONFIRMED',
        },
        include: { event: true, ticketType: true },
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: currentUser(req).id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            city: true,
            country: true,
            photos: true,
            status: true,
            organizer: { select: { id: true, firstName: true, lastName: true, username: true, email: true } },
          },
        },
        ticketType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getOrganizerBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { event: { organizerId: currentUser(req).id } },
      include: {
        event: { select: { id: true, title: true, city: true, photos: true } },
        user: { select: { id: true, username: true, firstName: true, lastName: true, email: true, phone: true } },
        ticketType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
