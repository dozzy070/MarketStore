import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Helper to generate a unique session ID (falls back to timestamp+random)
const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// The AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('🔐 AuthProvider - Initializing...');
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const storedSessionId = localStorage.getItem('sessionId');
      const tabSessionId = sessionStorage.getItem('sessionId');

      console.log('🔐 AuthProvider - Storage check:', { 
        token: token ? 'exists' : 'missing', 
        userData: userData ? 'exists' : 'missing',
        storedSessionId: storedSessionId ? 'exists' : 'missing',
        tabSessionId: tabSessionId ? 'exists' : 'missing'
      });

      // If there's a token but the session IDs don't match, this is a new tab
      if (token && userData && storedSessionId && storedSessionId !== tabSessionId) {
        console.log('🔐 AuthProvider - New tab detected! Logging out.');
        // Clear local state only – keep localStorage for other tabs
        setUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('sessionId'); // prevent future mismatches
        navigate('/login');
        toast.error('Session active in another tab. Please log in again to continue.');
        setLoading(false);
        return;
      }

      // Normal load if session IDs match (or no sessionId present – treat as old session)
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('🔐 AuthProvider - User loaded from storage:', parsedUser);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Ensure sessionId exists (for backwards compatibility)
        if (!storedSessionId) {
          const newSessionId = generateSessionId();
          localStorage.setItem('sessionId', newSessionId);
          sessionStorage.setItem('sessionId', newSessionId);
        } else if (!tabSessionId) {
          // If we have a stored sessionId but no tabSessionId (e.g., first load after update)
          sessionStorage.setItem('sessionId', storedSessionId);
        }
      } else {
        console.log('🔐 AuthProvider - No stored credentials found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('🔐 AuthProvider - Error loading from storage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      sessionStorage.removeItem('sessionId');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthProvider - Login attempt for:', email);
      console.log('🔐 AuthProvider - API URL:', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      console.log('🔐 AuthProvider - Full login response:', response);
      console.log('🔐 AuthProvider - Response data:', response.data);

      // Handle different response structures
      let token, user;

      if (response.data) {
        // Case 1: { success: true, data: { token, user } }
        if (response.data.success && response.data.data) {
          console.log('✅ Response structure: {success, data}');
          token = response.data.data.token;
          user = response.data.data.user;
        }
        // Case 2: { token, user } directly
        else if (response.data.token && response.data.user) {
          console.log('✅ Response structure: {token, user}');
          token = response.data.token;
          user = response.data.user;
        }
        // Case 3: { data: { token, user } }
        else if (response.data.data && response.data.data.token) {
          console.log('✅ Response structure: {data: {token, user}}');
          token = response.data.data.token;
          user = response.data.data.user;
        }
        // Case 4: { accessToken, user } 
        else if (response.data.accessToken && response.data.user) {
          console.log('✅ Response structure: {accessToken, user}');
          token = response.data.accessToken;
          user = response.data.user;
        }
      }

      if (token && user) {
        console.log('✅ Successfully extracted token and user:', { token: token.substring(0, 20) + '...', user });
        
        // Generate a unique session ID for this tab
        const sessionId = generateSessionId();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('sessionId', sessionId);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('🔐 AuthProvider - Login successful');
        return { success: true, user };
      } else {
        console.error('❌ Could not extract token/user from response:', response.data);
        return { 
          success: false, 
          error: 'Invalid response structure from server' 
        };
      }
    } catch (error) {
      console.error('🔐 AuthProvider - Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    console.log('🔐 AuthProvider - Logging out');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    sessionStorage.removeItem('sessionId');
    
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('🔐 AuthProvider - Logout complete');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      console.log('🔐 AuthProvider - Register attempt:', { email: userData.email });
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      console.log('🔐 AuthProvider - Register response:', response.data);

      let token, user;

      if (response.data) {
        if (response.data.success && response.data.data) {
          token = response.data.data.token;
          user = response.data.data.user;
        } else if (response.data.token && response.data.user) {
          token = response.data.token;
          user = response.data.user;
        } else if (response.data.data && response.data.data.token) {
          token = response.data.data.token;
          user = response.data.data.user;
        }
      }

      if (token && user) {
        const sessionId = generateSessionId();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('sessionId', sessionId);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('🔐 AuthProvider - Registration successful');
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: response.data?.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('🔐 AuthProvider - Registration error:', error);
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

// Default export for easier importing and to satisfy Fast Refresh
export default AuthProvider;