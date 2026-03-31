import axiosInstance from './axiosInstance';

export const login = (email: string, password: string) =>
  axiosInstance.post('/auth/login', { email, password });

export const register = (data: { name: string; email: string; password: string; role: string }) =>
  axiosInstance.post('/auth/register', data);

export const getMe = () => axiosInstance.get('/auth/me');
