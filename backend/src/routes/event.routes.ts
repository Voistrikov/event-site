import { Router } from 'express';
import {
  cancelEvent,
  addEventPhotos,
  completeEvent,
  createEvent,
  deleteEvent,
  deleteEventPhoto,
  getEventById,
  getEvents,
  getRecommendedEventsHandler,
  publishEvent,
  setMainEventPhoto,
  updateEvent,
} from '../controllers/event.controller.js';
import { authenticate, authenticateOptional } from '../middleware/authenticate.middleware.js';
import { authorise } from '../middleware/authorise.middleware.js';
import { uploadEventPhotos } from '../middleware/upload.middleware.js';

export const eventRouter = Router();

// Allow optional auth for recommendations
eventRouter.get('/recommended', authenticateOptional, getRecommendedEventsHandler);

eventRouter.get('/', authenticateOptional, getEvents);
eventRouter.post('/', authenticate, authorise('ORGANIZER', 'ADMIN'), createEvent);
eventRouter.get('/:id', authenticateOptional, getEventById);
eventRouter.post('/:id/photos', authenticate, authorise('ORGANIZER', 'ADMIN'), uploadEventPhotos, addEventPhotos);
eventRouter.delete('/:id/photos/:photoId', authenticate, authorise('ORGANIZER', 'ADMIN'), deleteEventPhoto);
eventRouter.patch('/:id/photos/:photoId/main', authenticate, authorise('ORGANIZER', 'ADMIN'), setMainEventPhoto);
eventRouter.put('/:id', authenticate, authorise('ORGANIZER', 'ADMIN'), updateEvent);
eventRouter.delete('/:id', authenticate, authorise('ORGANIZER', 'ADMIN'), deleteEvent);
eventRouter.patch('/:id/cancel', authenticate, authorise('ORGANIZER', 'ADMIN'), cancelEvent);
eventRouter.patch('/:id/complete', authenticate, authorise('ORGANIZER', 'ADMIN'), completeEvent);
eventRouter.patch('/:id/publish', authenticate, authorise('ORGANIZER', 'ADMIN'), publishEvent);
