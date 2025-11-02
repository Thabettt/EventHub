import axios from "axios";

const API_URL = "http://localhost:3003/api"; // Adjust based on your backend URL

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/admin/dashboard`, config);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

/**
 * Get events analytics
 */
export const getEventsAnalytics = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_URL}/admin/analytics/events`,
      config
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching events analytics:", error);
    throw error;
  }
};

/**
 * Get bookings analytics
 */
export const getBookingsAnalytics = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_URL}/admin/analytics/bookings`,
      config
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bookings analytics:", error);
    throw error;
  }
};

/**
 * Get users analytics
 */
export const getUsersAnalytics = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_URL}/admin/analytics/users`,
      config
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users analytics:", error);
    throw error;
  }
};

/**
 * Approve event
 */
export const approveEvent = async (eventId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(
      `${API_URL}/events/${eventId}/approve`,
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error approving event:", error);
    throw error;
  }
};

/**
 * Reject event
 */
export const rejectEvent = async (eventId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(
      `${API_URL}/events/${eventId}/reject`,
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting event:", error);
    throw error;
  }
};
