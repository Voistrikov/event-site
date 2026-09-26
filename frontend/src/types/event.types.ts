import type { User } from './user.types';

export const EVENT_TYPES = [
  { value: 'CONCERT', label: 'Συναυλία' },
  { value: 'SEMINAR', label: 'Σεμινάριο' },
  { value: 'THEATER', label: 'Θεατρική Παράσταση' },
  { value: 'CONFERENCE', label: 'Ημερίδα / Συνέδριο' },
  { value: 'WORKSHOP', label: 'Εργαστήριο' },
  { value: 'FESTIVAL', label: 'Φεστιβάλ' },
  { value: 'SPORTS', label: 'Αθλητικό Γεγονός' },
  { value: 'EXHIBITION', label: 'Έκθεση' },
  { value: 'OTHER', label: 'Άλλο' },
] as const;

export type EventType = typeof EVENT_TYPES[number]['value'];
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export interface Category { id: string; name: string; }
export interface EventCategory { categoryId?: string; category: Category; }

export interface TicketType {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  available: number;
}

export interface EventPhoto { id: string; filename: string; isMain?: boolean; sortOrder?: number; }

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  venue: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  status: EventStatus;
  organizerId: string;
  organizer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> & Partial<Pick<User, 'username' | 'email'>>;
  categories: EventCategory[];
  ticketTypes: TicketType[];
  photos?: EventPhoto[];
  createdAt: string;
  updatedAt?: string;
  totalBooked?: number;
  _count?: { bookings: number };
  isRecommended?: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  eventType: EventType;
  venue: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  categories: string[];
  ticketTypes: Array<Pick<TicketType, 'name' | 'price' | 'quantity'> & { id?: string }>;
}

export function eventTypeLabel(type: string): string {
  return EVENT_TYPES.find((item) => item.value === type)?.label ?? type;
}
