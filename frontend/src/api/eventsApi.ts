import axiosInstance from './axiosInstance';
import type { EventFormData } from '../types/event.types';

export const getEvents = (params?: Record<string, unknown>) =>
  axiosInstance.get('/events', { params });

export const getRecommendedEvents = () =>
  axiosInstance.get('/events/recommended');

export const getEvent = (id: string) => axiosInstance.get(`/events/${id}`);

export const getCategories = () => axiosInstance.get('/categories');

export const createEvent = (data: FormData | EventFormData | Record<string, unknown>) =>
  axiosInstance.post('/events', data);

export const updateEvent = (id: string, data: FormData | EventFormData | Record<string, unknown>) =>
  axiosInstance.put(`/events/${id}`, data);

export const deleteEvent = (id: string) => axiosInstance.delete(`/events/${id}`);

export const publishEvent = (id: string) => axiosInstance.patch(`/events/${id}/publish`);

export const cancelEvent = (id: string) => axiosInstance.patch(`/events/${id}/cancel`);

export const completeEvent = (id: string) => axiosInstance.patch(`/events/${id}/complete`);

export const addEventPhotos = (id: string, files: File[]) => {
  const data = new FormData();
  files.forEach((file) => data.append('photos', file));
  return axiosInstance.post(`/events/${id}/photos`, data);
};
export const deleteEventPhoto = (id: string, photoId: string) => axiosInstance.delete(`/events/${id}/photos/${photoId}`);
export const setMainEventPhoto = (id: string, photoId: string) => axiosInstance.patch(`/events/${id}/photos/${photoId}/main`);
