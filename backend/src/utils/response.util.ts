import type { Response } from 'express';

export interface ErrorBody {
  error: string;
  code: string;
}

export interface PaginatedBody<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  code: string,
): void {
  res.status(status).json({ error: message, code } satisfies ErrorBody);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
): void {
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedBody<T>);
}
