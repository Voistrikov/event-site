import { Router } from 'express';
import { createBooking, getUserBookings, getOrganizerBookings } from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorise } from '../middleware/authorise.middleware.js';

export const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticate);

bookingRouter.get('/', getUserBookings);
bookingRouter.get('/organizer', getOrganizerBookings);
bookingRouter.post('/', authorise('ATTENDEE', 'ORGANIZER', 'ADMIN'), createBooking);
