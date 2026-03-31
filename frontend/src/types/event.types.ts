export interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  organizerId: string;
  ticketTypes: TicketType[];
  createdAt: string;
}
