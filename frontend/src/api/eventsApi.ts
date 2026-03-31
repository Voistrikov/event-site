import axiosInstance from './axiosInstance';

export const getEvents = (params?: Record<string, unknown>) =>
  axiosInstance.get('/events', { params });

export const getEvent = (id: string) => axiosInstance.get(`/events/${id}`);

export const createEvent = (data: FormData | Record<string, unknown>) =>
  axiosInstance.post('/events', data);

export const updateEvent = (id: string, data: FormData | Record<string, unknown>) =>
  axiosInstance.put(`/events/${id}`, data);

export const deleteEvent = (id: string) => axiosInstance.delete(`/events/${id}`);
