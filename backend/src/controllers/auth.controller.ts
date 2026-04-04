import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { sendError } from '../utils/response.util.js';
import { env } from '../config/env.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';


const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^\S+$/, 'Username must not contain spaces'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  country: z.string().min(2).max(100),
  taxId: z.string().min(1).max(20),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  role: z.enum(['ATTENDEE', 'ORGANIZER', 'ADMIN']),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

const REFRESH_COOKIE = 'refreshToken';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    path: '/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
}

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = registerSchema.parse(req.body);
    const user = await authService.register(dto);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof authService.AuthError) {
      sendError(res, err.httpStatus, err.message, err.code);
      return;
    }
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { identifier, password } = loginSchema.parse(req.body);
    const { response, rawRefreshToken } = await authService.login(identifier, password);
    setRefreshCookie(res, rawRefreshToken);
    res.json(response);
  } catch (err) {
    if (err instanceof authService.AuthError) {
      sendError(res, err.httpStatus, err.message, err.code);
      return;
    }
    next(err);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (!raw) {
      sendError(res, 401, 'Refresh token not provided.', 'MISSING_REFRESH_TOKEN');
      return;
    }
    const { accessToken, rawRefreshToken } = await authService.refresh(raw);
    setRefreshCookie(res, rawRefreshToken);
    res.json({ accessToken });
  } catch (err) {
    if (err instanceof authService.AuthError) {
      clearRefreshCookie(res);
      sendError(res, err.httpStatus, err.message, err.code);
      return;
    }
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = (req as AuthenticatedRequest).user;
    await authService.logout(id);
    clearRefreshCookie(res);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = (req as AuthenticatedRequest).user;
    const user = await authService.getMe(id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
