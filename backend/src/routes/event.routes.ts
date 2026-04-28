import { Router } from 'express';
import { getEvents, getRecommendedEventsHandler, getEventById } from '../controllers/event.controller.js';
import { authenticateOptional } from '../middleware/authenticate.middleware.js';

export const eventRouter = Router();

// Allow optional auth for recommendations
eventRouter.get('/recommended', authenticateOptional, getRecommendedEventsHandler);

eventRouter.get('/:id', getEventById);
eventRouter.get('/', getEvents);
