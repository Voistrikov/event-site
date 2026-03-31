import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export type Role = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_BYTES = 64;
const REFRESH_TOKEN_TTL_DAYS = 30;

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign({ role: payload.role }, env.JWT_SECRET, {
    subject: payload.sub,
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded.sub !== 'string' || typeof decoded['role'] !== 'string') {
      return null;
    }
    return { sub: decoded.sub, role: decoded['role'] as Role };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}
