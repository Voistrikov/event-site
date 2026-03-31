export type Role = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  taxId: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  role: 'ATTENDEE' | 'ORGANIZER';
}

export interface LoginFormData {
  /** Username or email address */
  identifier: string;
  password: string;
}

