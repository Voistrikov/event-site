import axiosInstance from './axiosInstance';

export const getBookings = () => axiosInstance.get('/bookings');

export const createBooking = (data: { eventId: string; ticketTypeId: string; quantity: number }) =>
  axiosInstance.post('/bookings', data);

export const cancelBooking = (id: string) => axiosInstance.delete(`/bookings/${id}`);
