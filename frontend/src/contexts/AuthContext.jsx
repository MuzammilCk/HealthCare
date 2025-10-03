import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    const controller = new AbortController();
    const failSafe = setTimeout(() => {
      if (!didCancel) setLoading(false);
    }, 12000);

    const init = async () => {
      try {
        const res = await api.get('/auth/me', { signal: controller.signal });
        if (!didCancel) setUser(res.data?.data || null);
      } catch (e) {
        if (!didCancel) setUser(null);
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
    init();

    return () => {
      didCancel = true;
      controller.abort();
      clearTimeout(failSafe);
    };
  }, []);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    const { user } = res.data;
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { user } = res.data;
    setUser(user);
    return user;
  };

  const logout = () => {
    return api.post('/auth/logout').finally(() => setUser(null));
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser, isAuthenticated: () => !!user }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
