import { Router } from 'express';
import {
  cancelEvent,
  completeEvent,
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getRecommendedEventsHandler,
  publishEvent,
  updateEvent,
} from '../controllers/event.controller.js';
import { authenticate, authenticateOptional } from '../middleware/authenticate.middleware.js';
import { authorise } from '../middleware/authorise.middleware.js';

export const eventRouter = Router();

// Allow optional auth for recommendations
eventRouter.get('/recommended', authenticateOptional, getRecommendedEventsHandler);

eventRouter.get('/', authenticateOptional, getEvents);
eventRouter.post('/', authenticate, authorise('ORGANIZER', 'ADMIN'), createEvent);
eventRouter.get('/:id', authenticateOptional, getEventById);
eventRouter.put('/:id', authenticate, authorise('ORGANIZER', 'ADMIN'), updateEvent);
eventRouter.delete('/:id', authenticate, authorise('ORGANIZER', 'ADMIN'), deleteEvent);
eventRouter.patch('/:id/cancel', authenticate, authorise('ORGANIZER', 'ADMIN'), cancelEvent);
eventRouter.patch('/:id/complete', authenticate, authorise('ORGANIZER', 'ADMIN'), completeEvent);
eventRouter.patch('/:id/publish', authenticate, authorise('ORGANIZER', 'ADMIN'), publishEvent);
