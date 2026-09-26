import type { Request } from 'express';
import type { Role } from '../utils/token.util.js';

export type { Role };

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegisterDto {
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
  role: 'ATTENDEE' | 'ORGANIZER';
  // exactOptionalPropertyTypes: must include | undefined to allow undefined values
  latitude?: number | undefined;
  longitude?: number | undefined;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface UserResponseDto {
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
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}

export interface AuthenticatedUser {
  id: string;
  role: Role;
  status: UserStatus;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
