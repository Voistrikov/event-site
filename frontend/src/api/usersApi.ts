import axiosInstance from './axiosInstance';

export const upgradeToOrganizer = () => axiosInstance.post('/users/upgrade');
