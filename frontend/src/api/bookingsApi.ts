import axiosInstance from './axiosInstance';

export const getBookings = () => axiosInstance.get('/bookings');
export const getOrganizerBookings = () => axiosInstance.get('/bookings/organizer');

export const createBooking = (data: { eventId: string; ticketTypeId: string; quantity: number; checkIn: string; checkOut: string }) =>
  axiosInstance.post('/bookings', data);

export const updateBookingStatus = (id: string, status: 'CONFIRMED' | 'REJECTED') => 
  axiosInstance.patch(`/bookings/${id}/status`, { status });

export const cancelBooking = (id: string) => axiosInstance.delete(`/bookings/${id}`);
