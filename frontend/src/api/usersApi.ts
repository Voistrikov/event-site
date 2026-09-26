import axiosInstance from './axiosInstance';

export const upgradeToOrganizer = () => axiosInstance.post('/users/upgrade');

export const uploadAvatar = (file: File) => {
  const data = new FormData();
  data.append('avatar', file);
  return axiosInstance.post('/users/avatar', data);
};

export const deleteAvatar = () => axiosInstance.delete('/users/avatar');
