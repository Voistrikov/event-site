export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}
