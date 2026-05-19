import { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { getStoredToken, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!getStoredToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await authApi.checkSession();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setStoredToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    if (response.success && response.user && response.token) {
      setStoredToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const verify2FA = async (email, otp) => {
    const response = await authApi.verify2FA(email, otp);
    if (response.success && response.user && response.token) {
      setStoredToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const signup = (userData) => {
    return authApi.signup(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    verify2FA,
    signup,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

