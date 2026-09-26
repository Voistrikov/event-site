import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Empty by default: requests go to the current origin and are proxied
// server-side to the backend (see vite.config.ts), so the browser only ever
// has to trust one HTTPS certificate. Set VITE_API_URL to call a backend on
// a different, browser-trusted origin instead (e.g. a real deployment).
const BASE_URL = import.meta.env['VITE_API_URL'] ?? '';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Always send cookies (refresh token)
});

// ---------------------------------------------------------------------------
// Request interceptor — attach current access token
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — transparent token refresh on 401
// ---------------------------------------------------------------------------
type ExtendedConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((entry) =>
    error ? entry.reject(error) : entry.resolve(token!),
  );
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as ExtendedConfig | undefined;

    // Only attempt refresh for 401s that haven't been retried
    if (
      !originalRequest ||
      axiosError.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Never try to refresh when the refresh endpoint itself returns 401
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Don't try to refresh when login itself fails (bad credentials)
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use a bare axios call to avoid re-triggering this interceptor
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        null,
        { withCredentials: true },
      );
      useAuthStore.getState().setToken(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;

