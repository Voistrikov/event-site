import { useAuthStore } from '../store/authStore';
import { getMe } from '../api/authApi';
import { login as loginApi } from '../api/authApi';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setAuth(res.data.user, res.data.token);
  };

  const logout = () => clearAuth();

  const fetchMe = async () => {
    const res = await getMe();
    setAuth(res.data, token!);
  };

  return { user, token, login, logout, fetchMe, isAuthenticated: !!token };
}
