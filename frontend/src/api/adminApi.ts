import axiosInstance from './axiosInstance';
import type { User, Role, UserStatus } from '../types/user.types';

export interface ListUsersParams {
  role?:   Role;
  status?: UserStatus;
  page?:   number;
  limit?:  number;
}

export interface ListUsersResponse {
  data:       User[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export const listUsers = (params?: ListUsersParams) =>
  axiosInstance.get<ListUsersResponse>('/admin/users', { params });

export const updateUserStatus = (id: string, status: 'APPROVED' | 'REJECTED') =>
  axiosInstance.patch<{ user: User }>(`/admin/users/${id}/status`, { status });

export const exportEventsJson = () =>
  axiosInstance.get('/admin/export/events/json', { responseType: 'blob' });

export const exportEventsXml = () =>
  axiosInstance.get('/admin/export/events/xml', { responseType: 'blob' });
