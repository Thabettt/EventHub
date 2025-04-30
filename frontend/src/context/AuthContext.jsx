import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      console.log("Initial auth check:", user ? "User found" : "No user");
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Auth context initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setCurrentUser(response.user);
    return response;
  };

  // ADD THESE MISSING FUNCTIONS
  const register = async (userData) => {
    const response = await authService.register(userData);
    setCurrentUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token: getToken(),
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};