import { create } from 'zustand';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  /** Update the access token only (called by axios refresh interceptor). */
  setToken: (token: string) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isInitialized: false,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  setInitialized: () => set({ isInitialized: true }),
}));

