import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";
import { setupInterceptors } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Force-logout helper: clears local storage user data and resets state.
  // Wrapped in useCallback so the reference is stable for the interceptor.
  const forceLogout = useCallback(() => {
    authService.clearAuthData();
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    // Wire up the global axios 401 interceptor so any API call
    // that returns 401 will automatically log the user out.
    setupInterceptors(forceLogout);

    try {
      // Token validity is now enforced server-side via HttpOnly cookie.
      // We only check if user data exists in localStorage for UI state.
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Auth context initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, [forceLogout]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setCurrentUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setCurrentUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential);
    setCurrentUser(response.user);
    return response;
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    googleLogin,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
