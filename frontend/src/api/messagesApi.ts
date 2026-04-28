import axiosInstance from './axiosInstance';

export const sendMessage = (data: { recipientId: string; subject: string; body: string }) =>
  axiosInstance.post('/messages', data);

export const getMyMessages = () =>
  axiosInstance.get('/messages');
