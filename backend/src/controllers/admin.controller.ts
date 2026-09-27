import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service.js';
import { sendError, sendPaginated } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

/** Escape special characters for XML attribute values */
function xmlAttr(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

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
    xml += '<!DOCTYPE Events [\n';
    xml += '  <!ELEMENT Events (Event*)>\n';
    xml += '  <!ELEMENT Event (Title, Category+, EventType, Venue, Address, City, Country, GeoLocation?, StartDateTime, EndDateTime, Capacity, TicketTypes, Bookings, Organizer, Status, Description, Media?)>\n';
    xml += '  <!ATTLIST Event EventID CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT Title (#PCDATA)>\n';
    xml += '  <!ELEMENT Category (#PCDATA)>\n';
    xml += '  <!ELEMENT EventType (#PCDATA)>\n';
    xml += '  <!ELEMENT Venue (#PCDATA)>\n';
    xml += '  <!ELEMENT Address (#PCDATA)>\n';
    xml += '  <!ELEMENT City (#PCDATA)>\n';
    xml += '  <!ELEMENT Country (#PCDATA)>\n';
    xml += '  <!ELEMENT GeoLocation EMPTY>\n';
    xml += '  <!ATTLIST GeoLocation Latitude CDATA #REQUIRED Longitude CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT StartDateTime (#PCDATA)>\n';
    xml += '  <!ELEMENT EndDateTime (#PCDATA)>\n';
    xml += '  <!ELEMENT Capacity (#PCDATA)>\n';
    xml += '  <!ELEMENT TicketTypes (TicketType+)>\n';
    xml += '  <!ELEMENT TicketType (Name, Price, Quantity, Available)>\n';
    xml += '  <!ATTLIST TicketType TicketTypeID CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT Name (#PCDATA)>\n';
    xml += '  <!ELEMENT Price (#PCDATA)>\n';
    xml += '  <!ELEMENT Quantity (#PCDATA)>\n';
    xml += '  <!ELEMENT Available (#PCDATA)>\n';
    xml += '  <!ELEMENT Bookings (Booking*)>\n';
    xml += '  <!ELEMENT Booking (Attendee, Time, TicketTypeRef, NumberOfTickets, TotalCost, BookingStatus)>\n';
    xml += '  <!ATTLIST Booking BookingID CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT Attendee EMPTY>\n';
    xml += '  <!ATTLIST Attendee UserID CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT Time (#PCDATA)>\n';
    xml += '  <!ELEMENT TicketTypeRef (#PCDATA)>\n';
    xml += '  <!ELEMENT NumberOfTickets (#PCDATA)>\n';
    xml += '  <!ELEMENT TotalCost (#PCDATA)>\n';
    xml += '  <!ELEMENT BookingStatus (#PCDATA)>\n';
    xml += '  <!ELEMENT Organizer EMPTY>\n';
    xml += '  <!ATTLIST Organizer UserID CDATA #REQUIRED>\n';
    xml += '  <!ELEMENT Status (#PCDATA)>\n';
    xml += '  <!ELEMENT Description (#PCDATA)>\n';
    xml += '  <!ELEMENT Media (Photo*)>\n';
    xml += '  <!ELEMENT Photo (#PCDATA)>\n';
    xml += ']>\n';
    xml += '<Events>\n';
    
    for (const e of events) {
      xml += `  <Event EventID="${xmlAttr(e.id)}">\n`;
      xml += `    <Title><![CDATA[${e.title}]]></Title>\n`;
      for (const ec of e.categories) {
        xml += `    <Category><![CDATA[${ec.category.name}]]></Category>\n`;
      }
      xml += `    <EventType><![CDATA[${e.eventType}]]></EventType>\n`;
      xml += `    <Venue><![CDATA[${e.venue}]]></Venue>\n`;
      xml += `    <Address><![CDATA[${e.address}]]></Address>\n`;
      xml += `    <City><![CDATA[${e.city}]]></City>\n`;
      xml += `    <Country><![CDATA[${e.country}]]></Country>\n`;
      if (e.latitude && e.longitude) {
        xml += `    <GeoLocation Latitude="${xmlAttr(e.latitude)}" Longitude="${xmlAttr(e.longitude)}"/>\n`;
      }
      xml += `    <StartDateTime>${e.startDateTime.toISOString()}</StartDateTime>\n`;
      xml += `    <EndDateTime>${e.endDateTime.toISOString()}</EndDateTime>\n`;
      xml += `    <Capacity>${e.capacity}</Capacity>\n`;
      
      xml += `    <TicketTypes>\n`;
      for (const t of e.ticketTypes) {
        xml += `      <TicketType TicketTypeID="${xmlAttr(t.id)}">\n`;
        xml += `        <Name><![CDATA[${t.name}]]></Name>\n`;
        xml += `        <Price>${t.price}</Price>\n`;
        xml += `        <Quantity>${t.quantity}</Quantity>\n`;
        xml += `        <Available>${t.available}</Available>\n`;
        xml += `      </TicketType>\n`;
      }
      xml += `    </TicketTypes>\n`;
      
      xml += `    <Bookings>\n`;
      for (const b of e.bookings) {
        xml += `      <Booking BookingID="${xmlAttr(b.id)}">\n`;
        xml += `        <Attendee UserID="${xmlAttr(b.user.username)}"/>\n`;
        xml += `        <Time>${b.createdAt.toISOString()}</Time>\n`;
        xml += `        <TicketTypeRef>${b.ticketTypeId}</TicketTypeRef>\n`;
        xml += `        <NumberOfTickets>${b.numberOfTickets}</NumberOfTickets>\n`;
        xml += `        <TotalCost>${b.totalCost}</TotalCost>\n`;
        xml += `        <BookingStatus>${b.status}</BookingStatus>\n`;
        xml += `      </Booking>\n`;
      }
      xml += `    </Bookings>\n`;
      
      xml += `    <Organizer UserID="${xmlAttr(e.organizer.username)}"/>\n`;
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
