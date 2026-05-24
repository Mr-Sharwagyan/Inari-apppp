import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('inari_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user session:', err.message);
        localStorage.removeItem('inari_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('inari_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register action
  const register = async (name, email, password, role, phone, address) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone,
        address,
      });
      const { token, ...userData } = res.data;
      
      // If it is a farmer registration, it starts as pending approval, so they can't log in immediately
      if (role === 'farmer') {
        setLoading(false);
        return userData; // do not save token, wait for admin approval
      }

      localStorage.setItem('inari_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('inari_token');
    setUser(null);
  };

  // Update Profile action
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
