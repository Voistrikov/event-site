import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import { getRecommendations } from '../services/recommendation.service.js';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types/auth.types.js';
import { AppError } from '../utils/appError.js';
import fs from 'node:fs/promises';
import path from 'node:path';

interface TicketTypeInput {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

function optionalUser(req: Request): AuthenticatedUser | undefined {
  return (req as Partial<AuthenticatedRequest>).user;
}

function requireUser(req: Request): AuthenticatedUser {
  return (req as AuthenticatedRequest).user;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseDate(value: unknown, field: string): Date {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new AppError(400, 'VALIDATION_ERROR', `${field} must be a valid date.`);
  return date;
}

function parseTicketTypes(value: unknown): TicketTypeInput[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new AppError(400, 'VALIDATION_ERROR', 'ticketTypes must be an array.');

  return value.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw new AppError(400, 'VALIDATION_ERROR', `ticketTypes[${index}] is invalid.`);
    const ticket = raw as Record<string, unknown>;
    const name = stringValue(ticket['name']);
    const price = numberValue(ticket['price']);
    const quantity = numberValue(ticket['quantity'] ?? ticket['capacity']);
    if (!name || price === undefined || price < 0 || quantity === undefined || !Number.isInteger(quantity) || quantity < 1) {
      throw new AppError(400, 'VALIDATION_ERROR', `ticketTypes[${index}] requires a name, non-negative price and positive integer quantity.`);
    }
    const id = stringValue(ticket['id']);
    return id ? { id, name, price, quantity } : { name, price, quantity };
  });
}

function parseCategories(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => !stringValue(item))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'categories must be an array of names.');
  }
  return [...new Set(value.map((item) => stringValue(item)!))];
}

function assertOwnerOrAdmin(event: { organizerId: string }, user: AuthenticatedUser): void {
  if (event.organizerId !== user.id && user.role !== 'ADMIN') {
    throw new AppError(403, 'FORBIDDEN', 'You are not allowed to manage this event.');
  }
}

const eventInclude = {
  ticketTypes: true,
  photos: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] },
  categories: { include: { category: true } },
  _count: { select: { bookings: true } },
} satisfies Prisma.EventInclude;

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, dateFrom, dateTo, eventType, city, lat, lng, organizerId } = req.query;
    const minPrice = numberValue(req.query['minPrice']);
    const maxPrice = numberValue(req.query['maxPrice']);
    if (req.query['minPrice'] !== undefined && minPrice === undefined) throw new AppError(400, 'VALIDATION_ERROR', 'minPrice must be numeric.');
    if (req.query['maxPrice'] !== undefined && maxPrice === undefined) throw new AppError(400, 'VALIDATION_ERROR', 'maxPrice must be numeric.');
    if ((minPrice !== undefined && minPrice < 0) || (maxPrice !== undefined && maxPrice < 0)) throw new AppError(400, 'VALIDATION_ERROR', 'Prices cannot be negative.');
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) throw new AppError(400, 'VALIDATION_ERROR', 'minPrice cannot exceed maxPrice.');

    const where: any = {};
    const requestedOrganizerId = stringValue(organizerId);
    const viewer = optionalUser(req);
    const canManageListing = requestedOrganizerId !== undefined
      && viewer !== undefined
      && (viewer.id === requestedOrganizerId || viewer.role === 'ADMIN');
    const statusParam = stringValue(req.query['status']);
    if (canManageListing && statusParam && ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(statusParam)) {
      where.status = statusParam;
    } else if (!canManageListing) {
      where.status = 'PUBLISHED';
    }
    if (requestedOrganizerId) where.organizerId = requestedOrganizerId;
    if (stringValue(search)) {
      where.OR = ['title', 'description', 'city', 'country'].map((field) => ({
        [field]: { contains: stringValue(search), mode: 'insensitive' },
      }));
    }
    if (stringValue(category)) {
      where.categories = { some: { category: { name: { equals: stringValue(category), mode: 'insensitive' } } } };
    }
    if (stringValue(eventType)) where.eventType = { equals: stringValue(eventType), mode: 'insensitive' };
    if (stringValue(city)) where.city = { equals: stringValue(city), mode: 'insensitive' };

    if (dateFrom !== undefined || dateTo !== undefined) {
      where.startDateTime = {};
      if (dateFrom !== undefined) where.startDateTime.gte = parseDate(dateFrom, 'dateFrom');
      if (dateTo !== undefined) where.startDateTime.lte = parseDate(dateTo, 'dateTo');
      if (where.startDateTime.gte && where.startDateTime.lte && where.startDateTime.gte > where.startDateTime.lte) {
        throw new AppError(400, 'VALIDATION_ERROR', 'dateFrom cannot be after dateTo.');
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.ticketTypes = { some: {} };
      if (minPrice !== undefined) where.ticketTypes.none = { price: { lt: minPrice } };
      if (maxPrice !== undefined) where.ticketTypes.some = { price: { lte: maxPrice } };
    }

    const page = Math.max(1, Math.trunc(numberValue(req.query['page']) ?? 1));
    const limit = Math.min(100, Math.max(1, Math.trunc(numberValue(req.query['limit']) ?? 9)));
    const skip = (page - 1) * limit;
    const targetLat = numberValue(lat);
    const targetLng = numberValue(lng);
    if ((lat !== undefined || lng !== undefined) && (targetLat === undefined || targetLng === undefined)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'lat and lng must both be numeric.');
    }

    if (targetLat !== undefined && targetLng !== undefined) {
      const allEvents = await prisma.event.findMany({ where, include: eventInclude });
      const radians = (degrees: number) => degrees * Math.PI / 180;
      const distance = (eventLat: number | null, eventLng: number | null) => {
        if (eventLat === null || eventLng === null) return Number.POSITIVE_INFINITY;
        const dLat = radians(eventLat - targetLat);
        const dLng = radians(eventLng - targetLng);
        const a = Math.sin(dLat / 2) ** 2
          + Math.cos(radians(targetLat)) * Math.cos(radians(eventLat)) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      allEvents.sort((a, b) => distance(a.latitude, a.longitude) - distance(b.latitude, b.longitude));
      res.json({ events: allEvents.slice(skip, skip + limit), total: allEvents.length, page, limit, totalPages: Math.ceil(allEvents.length / limit) });
      return;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: eventInclude }),
      prisma.event.count({ where }),
    ]);
    res.json({ events, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        ...eventInclude,
        organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          select: { numberOfTickets: true },
        },
      },
    });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');

    const user = optionalUser(req);
    if (event.status !== 'PUBLISHED' && event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    }
    if (user) {
      const recentView = await prisma.eventView.findFirst({
        where: {
          userId: user.id,
          eventId: id,
          viewedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (!recentView) await prisma.eventView.create({ data: { userId: user.id, eventId: id } });
    }

    const { bookings, ...eventData } = event;
    res.json({ ...eventData, totalBooked: bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0) });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    const required = ['title', 'eventType', 'venue', 'address', 'city', 'country', 'description'] as const;
    for (const field of required) {
      if (!stringValue(body[field])) throw new AppError(400, 'VALIDATION_ERROR', `${field} is required.`);
    }
    const capacity = numberValue(body['capacity']);
    if (capacity === undefined || !Number.isInteger(capacity) || capacity < 1) throw new AppError(400, 'VALIDATION_ERROR', 'capacity must be a positive integer.');
    const startDateTime = parseDate(body['startDateTime'], 'startDateTime');
    const endDateTime = parseDate(body['endDateTime'], 'endDateTime');
    if (endDateTime <= startDateTime) throw new AppError(400, 'INVALID_EVENT_DATES', 'endDateTime must be after startDateTime.');

    const ticketTypes = parseTicketTypes(body['ticketTypes']);
    if (ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0) > capacity) {
      throw new AppError(400, 'TICKET_QUANTITY_EXCEEDS_CAPACITY', 'Το άθροισμα εισιτηρίων υπερβαίνει τη χωρητικότητα της εκδήλωσης');
    }
    const categories = parseCategories(body['categories']);
    if (categories.length === 0) throw new AppError(400, 'NO_CATEGORIES', 'At least one category is required.');
    const latitude = numberValue(body['latitude']);
    const longitude = numberValue(body['longitude']);
    if (body['latitude'] !== undefined && latitude === undefined) throw new AppError(400, 'VALIDATION_ERROR', 'latitude must be numeric.');
    if (body['longitude'] !== undefined && longitude === undefined) throw new AppError(400, 'VALIDATION_ERROR', 'longitude must be numeric.');
    const event = await prisma.event.create({
      data: {
        title: stringValue(body['title'])!, eventType: stringValue(body['eventType'])!, venue: stringValue(body['venue'])!,
        address: stringValue(body['address'])!, city: stringValue(body['city'])!, country: stringValue(body['country'])!,
        description: stringValue(body['description'])!, capacity, startDateTime, endDateTime,
        organizerId: requireUser(req).id,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ticketTypes: { create: ticketTypes.map(({ name, price, quantity }) => ({ name, price, quantity, available: quantity })) },
        categories: {
          create: categories.map((name) => ({ category: { connectOrCreate: { where: { name }, create: { name } } } })),
        },
      },
      include: eventInclude,
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const body = req.body as Record<string, unknown>;
    const user = requireUser(req);
    const existing = await prisma.event.findUnique({ where: { id }, include: { ticketTypes: true, bookings: true } });
    if (!existing) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(existing, user);
    if (existing.status === 'CANCELLED') throw new AppError(400, 'EVENT_CANCELLED', 'Η εκδήλωση έχει ακυρωθεί');
    if (existing.status === 'COMPLETED') throw new AppError(400, 'EVENT_COMPLETED', 'Η εκδήλωση έχει ολοκληρωθεί');

    const updatedCapacity = body['capacity'] === undefined ? existing.capacity : numberValue(body['capacity']);
    if (updatedCapacity === undefined || !Number.isInteger(updatedCapacity) || updatedCapacity < 1) throw new AppError(400, 'VALIDATION_ERROR', 'capacity must be a positive integer.');
    const startDateTime = body['startDateTime'] === undefined ? existing.startDateTime : parseDate(body['startDateTime'], 'startDateTime');
    const endDateTime = body['endDateTime'] === undefined ? existing.endDateTime : parseDate(body['endDateTime'], 'endDateTime');
    if (endDateTime <= startDateTime) throw new AppError(400, 'INVALID_EVENT_DATES', 'endDateTime must be after startDateTime.');

    const suppliedTickets = body['ticketTypes'] !== undefined;
    const ticketTypes = suppliedTickets ? parseTicketTypes(body['ticketTypes']) : [];
    const totalTicketQuantity = suppliedTickets
      ? ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0)
      : existing.ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
    if (totalTicketQuantity > updatedCapacity) throw new AppError(400, 'TICKET_QUANTITY_EXCEEDS_CAPACITY', 'Ticket quantities exceed event capacity.');

    const updated = await prisma.$transaction(async (tx) => {
      if (suppliedTickets) {
        const existingIds = new Set(existing.ticketTypes.map((ticket) => ticket.id));
        for (const ticket of ticketTypes) {
          if (ticket.id && !existingIds.has(ticket.id)) throw new AppError(400, 'INVALID_TICKET_TYPE', 'A ticket type does not belong to this event.');
        }
        const retainedIds = new Set(ticketTypes.flatMap((ticket) => ticket.id ? [ticket.id] : []));
        for (const oldTicket of existing.ticketTypes.filter((ticket) => !retainedIds.has(ticket.id))) {
          const bookingCount = await tx.booking.count({ where: { ticketTypeId: oldTicket.id } });
          if (bookingCount > 0) throw new AppError(400, 'CANNOT_DELETE_BOOKED_TICKET_TYPE', 'Ticket types with bookings cannot be removed.');
          await tx.ticketType.delete({ where: { id: oldTicket.id } });
        }
        for (const ticket of ticketTypes) {
          if (ticket.id) {
            const active = await tx.booking.aggregate({
              where: { ticketTypeId: ticket.id, status: { in: ['PENDING', 'CONFIRMED'] } },
              _sum: { numberOfTickets: true },
            });
            const sold = active._sum.numberOfTickets ?? 0;
            if (ticket.quantity < sold) throw new AppError(400, 'TICKET_QUANTITY_BELOW_BOOKED', 'Ticket quantity cannot be lower than active bookings.');
            await tx.ticketType.update({
              where: { id: ticket.id }, data: { name: ticket.name, price: ticket.price, quantity: ticket.quantity, available: ticket.quantity - sold },
            });
          } else {
            await tx.ticketType.create({ data: { eventId: id, name: ticket.name, price: ticket.price, quantity: ticket.quantity, available: ticket.quantity } });
          }
        }
      }

      if (body['categories'] !== undefined) {
        const categories = parseCategories(body['categories']);
        if (categories.length === 0) throw new AppError(400, 'NO_CATEGORIES', 'At least one category is required.');
        await tx.eventCategory.deleteMany({ where: { eventId: id } });
        for (const name of categories) {
          const category = await tx.category.upsert({ where: { name }, update: {}, create: { name } });
          await tx.eventCategory.create({ data: { eventId: id, categoryId: category.id } });
        }
      }

      const data: any = { capacity: updatedCapacity, startDateTime, endDateTime };
      for (const field of ['title', 'eventType', 'venue', 'address', 'city', 'country', 'description'] as const) {
        if (body[field] !== undefined) {
          const value = stringValue(body[field]);
          if (!value) throw new AppError(400, 'VALIDATION_ERROR', `${field} cannot be empty.`);
          data[field] = value;
        }
      }
      for (const field of ['latitude', 'longitude'] as const) {
        if (body[field] !== undefined) {
          const value = numberValue(body[field]);
          if (value === undefined) throw new AppError(400, 'VALIDATION_ERROR', `${field} must be numeric.`);
          data[field] = value;
        }
      }
      return tx.event.update({ where: { id }, data, include: eventInclude });
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

function eventPhotos(req: Request): Express.Multer.File[] {
  return Array.isArray(req.files) ? req.files : [];
}

async function removeUploadedFiles(files: Express.Multer.File[]): Promise<void> {
  await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => undefined)));
}

async function removeStoredEventPhoto(filename: string): Promise<void> {
  if (!filename.startsWith('/uploads/events/')) return;
  await fs.unlink(path.resolve(process.cwd(), 'uploads', 'events', path.basename(filename))).catch(() => undefined);
}

export const addEventPhotos = async (req: Request, res: Response, next: NextFunction) => {
  const files = eventPhotos(req);
  try {
    if (files.length === 0) throw new AppError(400, 'VALIDATION_ERROR', 'At least one event photo is required.');
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({ where: { id }, include: { photos: true } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    if (event.photos.length + files.length > 3) throw new AppError(400, 'VALIDATION_ERROR', 'An event can have at most 3 photos.');
    const created = await prisma.$transaction(async (tx) => {
      const hasMain = event.photos.some((photo) => photo.isMain);
      const maxOrder = event.photos.reduce((max, photo) => Math.max(max, photo.sortOrder), -1);
      const photos = [];
      for (const [index, file] of files.entries()) {
        photos.push(await tx.eventPhoto.create({ data: { eventId: id, filename: `/uploads/events/${file.filename}`, sortOrder: maxOrder + index + 1, isMain: !hasMain && index === 0 } }));
      }
      return photos;
    });
    res.status(201).json({ photos: created });
  } catch (error) {
    await removeUploadedFiles(files);
    next(error);
  }
};

export const deleteEventPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params['id']);
    const photoId = String(req.params['photoId']);
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { photos: { orderBy: { sortOrder: 'asc' } } } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    const photo = event.photos.find((item) => item.id === photoId);
    if (!photo) throw new AppError(404, 'NOT_FOUND', 'Photo not found.');
    await prisma.$transaction(async (tx) => {
      await tx.eventPhoto.delete({ where: { id: photoId } });
      if (photo.isMain) {
        const replacement = event.photos.filter((item) => item.id !== photoId)[0];
        if (replacement) await tx.eventPhoto.update({ where: { id: replacement.id }, data: { isMain: true } });
      }
    });
    await removeStoredEventPhoto(photo.filename);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const setMainEventPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params['id']);
    const photoId = String(req.params['photoId']);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    const photo = await prisma.eventPhoto.findFirst({ where: { id: photoId, eventId } });
    if (!photo) throw new AppError(404, 'NOT_FOUND', 'Photo not found.');
    const updated = await prisma.$transaction(async (tx) => {
      await tx.eventPhoto.updateMany({ where: { eventId }, data: { isMain: false } });
      return tx.eventPhoto.update({ where: { id: photoId }, data: { isMain: true } });
    });
    res.json({ photo: updated });
  } catch (error) { next(error); }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { bookings: true } } } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    if (event.status !== 'DRAFT' && event.status !== 'PUBLISHED') {
      throw new AppError(400, 'EVENT_CANNOT_BE_DELETED', 'Cancelled or completed events cannot be deleted.');
    }
    if (event.status === 'PUBLISHED' && event._count.bookings > 0) {
      throw new AppError(400, 'CANNOT_DELETE_WITH_BOOKINGS', 'Δεν μπορείτε να διαγράψετε εκδήλωση με υπάρχουσες κρατήσεις. Χρησιμοποιήστε ακύρωση.');
    }
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const publishEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({ where: { id }, include: { ticketTypes: true } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    if (event.status !== 'DRAFT') throw new AppError(400, 'ONLY_DRAFT_CAN_BE_PUBLISHED', 'Only draft events can be published.');
    if (event.ticketTypes.length === 0) throw new AppError(400, 'NO_TICKET_TYPES', 'Πρέπει να υπάρχει τουλάχιστον ένας τύπος εισιτηρίου');
    if (event.startDateTime <= new Date()) throw new AppError(400, 'EVENT_ALREADY_STARTED', 'A past event cannot be published.');
    const updated = await prisma.event.update({ where: { id }, data: { status: 'PUBLISHED' }, include: eventInclude });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({
      where: { id },
      include: { bookings: { where: { status: { in: ['PENDING', 'CONFIRMED'] } }, select: { userId: true } } },
    });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    if (event.status !== 'PUBLISHED') throw new AppError(400, 'ONLY_PUBLISHED_CAN_BE_CANCELLED', 'Only published events can be cancelled.');

    const senderId = requireUser(req).id;
    const attendeeIds = [...new Set(event.bookings.map((booking) => booking.userId))];
    await prisma.$transaction(async (tx) => {
      await tx.event.update({ where: { id }, data: { status: 'CANCELLED' } });
      await tx.booking.updateMany({ where: { eventId: id, status: { in: ['PENDING', 'CONFIRMED'] } }, data: { status: 'CANCELLED' } });
      if (attendeeIds.length > 0) {
        await tx.message.createMany({
          data: attendeeIds.map((recipientId) => ({
            senderId,
            recipientId,
            subject: `Ακύρωση Εκδήλωσης: ${event.title}`,
            body: `Σας ενημερώνουμε ότι η εκδήλωση "${event.title}" που ήταν προγραμματισμένη για ${event.startDateTime.toLocaleDateString('el-GR')} έχει ακυρωθεί. Ζητούμε συγγνώμη για την αναστάτωση.`,
          })),
        });
      }
    }, { isolationLevel: 'Serializable' });
    res.json({ message: 'Event cancelled and attendees notified' });
  } catch (error) {
    next(error);
  }
};

export const completeEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params['id']);
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.');
    assertOwnerOrAdmin(event, requireUser(req));
    if (event.status !== 'PUBLISHED') {
      throw new AppError(400, 'ONLY_PUBLISHED_CAN_BE_COMPLETED', 'Only published events can be completed.');
    }
    if (event.endDateTime >= new Date()) {
      throw new AppError(400, 'EVENT_NOT_ENDED', 'The event can only be completed after its end date.');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: eventInclude,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getRecommendedEventsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recommendations = await getRecommendations(optionalUser(req)?.id);
    res.json({ events: recommendations });
  } catch (error) {
    next(error);
  }
};
