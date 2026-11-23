/**
 * AuthContext — exposes `user`, `loading`, `login`, `register`, `logout`.
 * Token is persisted in localStorage and re-hydrated on mount by calling
 * GET /api/auth/me to refresh the user profile.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, fetch the current user.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login and persist the returned JWT.
   * @param {{email:string,password:string}} creds
   */
  async function login(creds) {
    const res = await api.post('/auth/login', creds);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
    return res.data;
  }

  /**
   * Register a new account and auto-log in.
   * @param {object} payload
   */
  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
    return res.data;
  }

  /** Logout — wipe token and user state. */
  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  /** Convenience flag for role checks in components. */
  const hasRole = (...roles) => !!user && roles.includes(user.role);

  const value = { user, loading, login, register, logout, hasRole };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
