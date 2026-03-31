import axiosInstance from './axiosInstance';

export const getInbox = () => axiosInstance.get('/messages/inbox');

export const getSent = () => axiosInstance.get('/messages/sent');

export const sendMessage = (data: { recipientId: string; subject: string; body: string }) =>
  axiosInstance.post('/messages', data);

export const deleteMessage = (id: string) => axiosInstance.delete(`/messages/${id}`);
