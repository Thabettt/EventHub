import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3003/api"}/auth`;

// Create a configured axios instance
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send HttpOnly cookies with every request
});

// Register user
export const register = async (userData) => {
  try {
    const response = await authApi.post("/register", userData);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { success: false, message: "Registration failed" }
    );
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await authApi.post("/login", { email, password });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    if (error.message === "Network Error") {
      throw new Error(
        "Cannot connect to the authentication server. Please check if the backend server is running at " +
          API_URL,
      );
    }
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    // Token is sent automatically via HttpOnly cookie
    await authApi.post("/logout");
  } catch (error) {
    console.error(
      "Logout API call failed, proceeding with local logout",
      error,
    );
  } finally {
    // Remove user data from localStorage (token is cleared server-side via cookie)
    localStorage.removeItem("user");
  }

  return { success: true };
};

// Get current user
export const getCurrentUser = () => {
  const userString = localStorage.getItem("user");
  if (!userString) return null;
  return JSON.parse(userString);
};

// Clear auth data from localStorage (used for forced logout)
export const clearAuthData = () => {
  localStorage.removeItem("user");
};

// Check if user is logged in (based on user data in localStorage)
export const isAuthenticated = () => {
  return localStorage.getItem("user") !== null;
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await authApi.post("/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to process password reset",
      }
    );
  }
};

// Reset password
export const resetPassword = async (resetToken, password) => {
  try {
    const response = await authApi.put(`/reset-password/${resetToken}`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to reset password",
      }
    );
  }
};

// Google OAuth login
export const googleLogin = async (credential) => {
  try {
    const response = await authApi.post("/google", { credential });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { success: false, message: "Google login failed" }
    );
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  clearAuthData,
  isAuthenticated,
  forgotPassword,
  resetPassword,
  googleLogin,
};
