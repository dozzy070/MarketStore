import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* eslint-disable react-refresh/only-export-components */
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const verifyStoredSession = async () => {
      const token = localStorage.getItem('token');
      try {
        if (!token) {
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success !== true || !response.data.user) {
          throw new Error('The saved session is invalid');
        }

        const verifiedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(verifiedUser);
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        delete axios.defaults.headers.common.Authorization;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    void verifyStoredSession();
  }, [API_URL]);

  const completeLogin = useCallback((token, authenticatedUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user: authenticatedUser } = response.data || {};
      if (response.data?.success !== true || !token || !authenticatedUser) {
        return { success: false, error: 'Invalid response from authentication server' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.data?.success === true && response.data.user) {
        return { success: true, user: response.data.user };
      }
      return {
        success: false,
        error: response.data?.message || 'Registration failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    completeLogin,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
