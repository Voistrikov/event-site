export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  numberOfTickets: number;
  totalCost: number;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  createdAt: string;
  event?: any;
  user?: any;
}
