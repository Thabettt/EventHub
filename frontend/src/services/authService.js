import axios from "axios";

const API_URL = "http://localhost:3003/api/auth";

// Create a configured axios instance
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Register user
export const register = async (userData) => {
  try {
    const response = await authApi.post("/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
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
    console.log("Attempting to connect to:", API_URL + "/login");
    const response = await authApi.post("/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Auth service login error:", error);

    // More detailed error logging
    if (error.message === "Network Error") {
      console.error("Network error details:", {
        baseURL: authApi.defaults.baseURL,
        requestURL: "/login",
        requestData: { email, password: "[REDACTED]" },
        errorName: error.name,
        errorStack: error.stack,
      });

      throw new Error(
        "Cannot connect to the authentication server. Please check if the backend server is running at " +
          API_URL
      );
    }

    // Preserve the full error structure
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Set the token in the request header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await authApi.post("/logout", {}, config);
    }

  } catch (error) {
    // Determine strict failure vs just server error
    // If 401, we still want to proceed with local logout
    console.error("Logout API call failed, proceeding with local logout", error);
  } finally {
    // Remove user from localStorage
    localStorage.removeItem("token");
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

// Check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
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

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  forgotPassword,
  resetPassword,
};
