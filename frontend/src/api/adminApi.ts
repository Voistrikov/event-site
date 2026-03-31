import axiosInstance from './axiosInstance';

export const getPendingUsers = () => axiosInstance.get('/admin/users/pending');

export const approveUser = (id: string) => axiosInstance.post(`/admin/users/${id}/approve`);

export const rejectUser = (id: string) => axiosInstance.post(`/admin/users/${id}/reject`);

export const exportUsersXml = () =>
  axiosInstance.get('/admin/export/users.xml', { responseType: 'blob' });

export const exportUsersJson = () => axiosInstance.get('/admin/export/users.json');
