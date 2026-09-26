import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
