import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Received booking request:', req.body);
  try {
    const { eventId, ticketTypeId, quantity, checkIn, checkOut } = req.body;
    const userId = (req as any).user.id;

    if (!eventId || !ticketTypeId || !quantity || !checkIn || !checkOut) {
      res.status(400).json({ error: 'eventId, ticketTypeId, quantity, checkIn, and checkOut are required' });
      return;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (endDate <= startDate) {
      res.status(400).json({ error: 'Check-out date must be after check-in date' });
      return;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays > 0 ? diffDays : 1; // At least 1 night for booking if same day (though we check <=)

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true }
    });

    if (!ticketType || ticketType.eventId !== eventId) {
      res.status(404).json({ error: 'Ticket type not found for this event' });
      return;
    }

    if (ticketType.available < quantity) {
      res.status(400).json({ error: 'Not enough tickets available' });
      return;
    }

    // Transaction to ensure atomicity
    const booking = await prisma.$transaction(async (tx) => {
      // Update availability
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { available: { decrement: quantity } }
      });

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          eventId,
          userId,
          ticketTypeId,
          numberOfTickets: quantity,
          totalCost: Number(ticketType.price) * nights,
          checkIn: startDate,
          checkOut: endDate,
          status: 'PENDING'
        }
      });

      return newBooking;
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
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
            organizer: {
              select: {
                id: true,
                firstName: true,
                email: true
              }
            }
          }
        },
        ticketType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({ error: 'Booking is already cancelled' });
      return;
    }

    // Transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Restore ticket availability
      await tx.ticketType.update({
        where: { id: booking.ticketTypeId },
        data: { available: { increment: booking.numberOfTickets } }
      });

      // Update booking status
      return tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    });

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

export const getOrganizerBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        event: {
          organizerId: userId
        }
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            city: true,
            photos: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        ticketType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED or REJECTED
    const userId = (req as any).user.id;

    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Use CONFIRMED or REJECTED.' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.event.organizerId !== userId) {
      res.status(403).json({ error: 'Not authorized to manage this booking' });
      return;
    }

    if (booking.status !== 'PENDING') {
      res.status(400).json({ error: `Cannot update status from ${booking.status}` });
      return;
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      // If rejected, restore availability
      if (status === 'REJECTED') {
        await tx.ticketType.update({
          where: { id: booking.ticketTypeId },
          data: { available: { increment: booking.numberOfTickets } }
        });
      }

      return tx.booking.update({
        where: { id },
        data: { status }
      });
    });

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};
