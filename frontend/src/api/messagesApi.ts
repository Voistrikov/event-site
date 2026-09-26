import axiosInstance from './axiosInstance';

export const getInbox = () => axiosInstance.get('/messages/inbox');

export const getSent = () => axiosInstance.get('/messages/sent');

export const sendMessage = (data: { recipientId: string; subject: string; body: string }) =>
  axiosInstance.post('/messages', data);

export const getUnreadCount = () => axiosInstance.get<{ unreadCount: number }>('/messages/unread-count');
export const markMessageAsRead = (id: string) => axiosInstance.patch(`/messages/${id}/read`);
export const deleteInboxMessage = (id: string) => axiosInstance.delete(`/messages/${id}/inbox`);
export const deleteSentMessage = (id: string) => axiosInstance.delete(`/messages/${id}/sent`);
