import axios from "axios";

const API_URL = "http://localhost:3003/api/users";

// Create a configured axios instance
const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add auth token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get current user profile
export const getUserProfile = async () => {
  try {
    const response = await userApi.get("/me", {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get profile",
      }
    );
  }
};

// Update user profile (can update name, email, password)
export const updateProfile = async (userData) => {
  try {
    const response = await userApi.put("/me", userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update profile",
      }
    );
  }
};

// Change password specifically
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await userApi.put(
      "/me/password",
      { currentPassword, password: newPassword },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to change password",
      }
    );
  }
};

export default {
  getUserProfile,
  updateProfile,
  changePassword,
};
