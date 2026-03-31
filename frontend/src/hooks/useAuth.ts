import { useAuthStore } from '../store/authStore';
import { login as loginApi, logout as logoutApi, getMe } from '../api/authApi';
import type { LoginFormData } from '../types/user.types';

export function useAuth() {
  const { user, token, isInitialized, setAuth, setInitialized, clearAuth } =
    useAuthStore();

  /**
   * Called once on app mount. If a stored token exists, fetches the current
   * user to rehydrate the store. Always sets isInitialized when done.
   */
  const initialize = async (): Promise<void> => {
    if (isInitialized) return;
    const currentToken = useAuthStore.getState().token;
    if (currentToken) {
      try {
        const res = await getMe();
        // Only update if no newer login has replaced the token
        if (useAuthStore.getState().token === currentToken) {
          setAuth(res.data.user, currentToken);
        }
      } catch {
        // Only clear auth if the token hasn't been replaced by a fresh login
        if (useAuthStore.getState().token === currentToken) {
          clearAuth();
        }
      }
    }
    setInitialized();
  };

  const login = async (data: LoginFormData): Promise<void> => {
    const res = await loginApi(data);
    setAuth(res.data.user, res.data.accessToken);
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // Ignore errors — always clear local state
    }
    clearAuth();
  };

  const fetchMe = async (): Promise<void> => {
    const res = await getMe();
    if (token) setAuth(res.data.user, token);
  };

  return {
    user,
    token,
    isInitialized,
    isAuthenticated: !!user,
    login,
    logout,
    fetchMe,
    initialize,
  };
}

