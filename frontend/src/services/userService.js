import api from "./api";

// Get current user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get("/users/me");
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
    const response = await api.put("/users/me", userData);
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
    const response = await api.put("/users/me/password", {
      currentPassword,
      password: newPassword,
    });
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

// Admin: Get all users
export const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const response = await api.get(`/users/?${queryParams.toString()}`);
    return response.data; // Expecting { success: true, data: [...] }
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch users",
      }
    );
  }
};

// Admin: Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update user role",
      }
    );
  }
};

// Admin: Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to delete user",
      }
    );
  }
};

export default {
  getUserProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
