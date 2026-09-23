import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('intellistock_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('intellistock_token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('intellistock_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('intellistock_token');
        localStorage.removeItem('intellistock_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    localStorage.setItem('intellistock_token', res.data.token);
    localStorage.setItem('intellistock_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Stores a fresh {user, token} pair. Used after first-admin OTP verification
  // and after an in-app password change (both return a new session the same
  // shape as login - a password change bumps tokenVersion, so the token must
  // be refreshed too or the very next request would be rejected).
  const setSession = useCallback(({ user: newUser, token }) => {
    localStorage.setItem('intellistock_token', token);
    localStorage.setItem('intellistock_user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('intellistock_token');
    localStorage.removeItem('intellistock_user');
    setUser(null);
  }, []);

  const updateLocalUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('intellistock_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const can = useCallback((...roles) => user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, setSession, logout, updateLocalUser, can, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
