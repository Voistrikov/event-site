import type { Event, TicketType } from './event.types';
import type { User } from './user.types';

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  numberOfTickets: number;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  createdAt: string;
  event?: Event;
  ticketType?: TicketType;
  user?: User;
}

export interface CreateBookingPayload {
  eventId: string;
  ticketTypeId: string;
  numberOfTickets: number;
}
