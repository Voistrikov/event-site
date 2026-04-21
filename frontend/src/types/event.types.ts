export interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  available: number;
}

export interface EventPhoto {
  id: string;
  filename: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  startDateTime?: string;
  endDateTime?: string;
  organizerId: string;
  ticketTypes: TicketType[];
  photos?: EventPhoto[];
  createdAt: string;
}
