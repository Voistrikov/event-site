import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service.js';
import { sendError, sendPaginated } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

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

    if (status === 'REJECTED') {
      if ((req as AuthenticatedRequest).user?.id === id) {
        res.status(400).json({ message: 'Admin cannot reject their own account.' });
        return;
      }
      const targetUser = await adminService.getUserById(id);
      if (targetUser.role === 'ADMIN') {
        res.status(400).json({ message: 'Cannot reject an administrator account.' });
        return;
      }
    }

    const user = await adminService.updateUserStatus(id, status);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const user = await adminService.getUserById(id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function exportEventsJsonHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const events = await adminService.getAllEventsForExport();
    res.setHeader('Content-disposition', 'attachment; filename=events.json');
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(events, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function exportEventsXmlHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const events = await adminService.getAllEventsForExport();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Events>\n';
    
    for (const e of events) {
      xml += `  <Event EventID="${e.id}">\n`;
      xml += `    <Title><![CDATA[${e.title}]]></Title>\n`;
      // We don't have categories dynamically mapped right now, we use a single eventType, but let's map it to category for DTD compliance
      xml += `    <Category><![CDATA[${e.eventType}]]></Category>\n`;
      xml += `    <EventType><![CDATA[${e.eventType}]]></EventType>\n`;
      xml += `    <Venue><![CDATA[${e.venue}]]></Venue>\n`;
      xml += `    <Address><![CDATA[${e.address}]]></Address>\n`;
      xml += `    <City><![CDATA[${e.city}]]></City>\n`;
      xml += `    <Country><![CDATA[${e.country}]]></Country>\n`;
      if (e.latitude && e.longitude) {
        xml += `    <GeoLocation Latitude="${e.latitude}" Longitude="${e.longitude}"/>\n`;
      }
      xml += `    <StartDateTime>${e.startDateTime.toISOString()}</StartDateTime>\n`;
      xml += `    <EndDateTime>${e.endDateTime.toISOString()}</EndDateTime>\n`;
      xml += `    <Capacity>${e.capacity}</Capacity>\n`;
      
      xml += `    <TicketTypes>\n`;
      for (const t of e.ticketTypes) {
        xml += `      <TicketType TicketTypeID="${t.id}">\n`;
        xml += `        <Name><![CDATA[${t.name}]]></Name>\n`;
        xml += `        <Price>${t.price}</Price>\n`;
        xml += `        <Quantity>${t.quantity}</Quantity>\n`;
        xml += `        <Available>${t.available}</Available>\n`;
        xml += `      </TicketType>\n`;
      }
      xml += `    </TicketTypes>\n`;
      
      xml += `    <Bookings>\n`;
      for (const b of e.bookings) {
        xml += `      <Booking BookingID="${b.id}">\n`;
        xml += `        <Attendee UserID="${b.user.username}"/>\n`;
        xml += `        <Time>${b.createdAt.toISOString()}</Time>\n`;
        xml += `        <TicketTypeRef>${b.ticketTypeId}</TicketTypeRef>\n`;
        xml += `        <NumberOfTickets>${b.numberOfTickets}</NumberOfTickets>\n`;
        xml += `        <TotalCost>${b.totalCost}</TotalCost>\n`;
        xml += `        <BookingStatus>${b.status}</BookingStatus>\n`;
        xml += `      </Booking>\n`;
      }
      xml += `    </Bookings>\n`;
      
      xml += `    <Organizer UserID="${e.organizer.username}"/>\n`;
      xml += `    <Status>${e.status}</Status>\n`;
      xml += `    <Description><![CDATA[${e.description}]]></Description>\n`;
      
      if (e.photos && e.photos.length > 0) {
        xml += `    <Media>\n`;
        for (const p of e.photos) {
          xml += `      <Photo><![CDATA[${p.filename}]]></Photo>\n`;
        }
        xml += `    </Media>\n`;
      }
      
      xml += `  </Event>\n`;
    }
    
    xml += '</Events>';
    
    res.setHeader('Content-disposition', 'attachment; filename=events.xml');
    res.setHeader('Content-type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
}
