import axiosInstance from './axiosInstance';

export const getRecommendations = () => axiosInstance.get('/recommendations');
