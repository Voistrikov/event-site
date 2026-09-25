import axiosInstance from './axiosInstance';

export const sendMessage = (data: { recipientId: string; subject: string; body: string }) =>
  axiosInstance.post('/messages', data);

export const getMyMessages = () =>
  axiosInstance.get('/messages');

export const getUnreadCount = () => axiosInstance.get<{ unreadCount: number }>('/messages/unread-count');
export const markMessageAsRead = (id: string) => axiosInstance.patch(`/messages/${id}/read`);
export const deleteInboxMessage = (id: string) => axiosInstance.delete(`/messages/${id}/inbox`);
export const deleteSentMessage = (id: string) => axiosInstance.delete(`/messages/${id}/sent`);
