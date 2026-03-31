import axiosInstance from './axiosInstance';
import type { User, RegisterFormData, LoginFormData } from '../types/user.types';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const login = (data: LoginFormData) =>
  axiosInstance.post<AuthResponse>('/auth/login', data);

export const register = (data: RegisterFormData) =>
  axiosInstance.post<{ user: User }>('/auth/register', data);

/** Uses withCredentials so the httpOnly refresh cookie is sent automatically. */
export const refreshToken = () =>
  axiosInstance.post<{ accessToken: string }>('/auth/refresh');

export const logout = () =>
  axiosInstance.post<void>('/auth/logout');

export const getMe = () =>
  axiosInstance.get<{ user: User }>('/auth/me');

