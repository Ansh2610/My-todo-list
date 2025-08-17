import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        username,
        password,
        rememberMe
      });

      const { token, user } = response.data;
      
      // Set cookie with appropriate expiry
      Cookies.set('token', token, { 
        expires: rememberMe ? 30 : 7,
        sameSite: 'strict'
      });
      
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        rememberMe
      });

      const { token, user } = response.data;
      
      Cookies.set('token', token, { 
        expires: rememberMe ? 30 : 7,
        sameSite: 'strict'
      });
      
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};