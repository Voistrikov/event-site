import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking, getOrganizerBookings, updateBookingStatus } from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

export const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticate);

bookingRouter.get('/', getUserBookings);
bookingRouter.get('/organizer', getOrganizerBookings);
bookingRouter.post('/', createBooking);
bookingRouter.patch('/:id/status', updateBookingStatus);
bookingRouter.delete('/:id', cancelBooking);
