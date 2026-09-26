import axiosInstance from './axiosInstance';
import type { CreateBookingPayload } from '../types/booking.types';

export const getBookings = () => axiosInstance.get('/bookings');
export const getOrganizerBookings = () => axiosInstance.get('/bookings/organizer');

export const createBooking = (data: CreateBookingPayload) =>
  axiosInstance.post('/bookings', data);
