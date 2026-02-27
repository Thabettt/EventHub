import api from "./api";

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

/**
 * Get events analytics
 */
export const getEventsAnalytics = async () => {
  try {
    const response = await api.get("/admin/analytics/events");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching events analytics:", error);
    throw error;
  }
};

/**
 * Get bookings analytics
 */
export const getBookingsAnalytics = async () => {
  try {
    const response = await api.get("/admin/analytics/bookings");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bookings analytics:", error);
    throw error;
  }
};

/**
 * Get users analytics
 */
export const getUsersAnalytics = async () => {
  try {
    const response = await api.get("/admin/analytics/users");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users analytics:", error);
    throw error;
  }
};

/**
 * Approve event
 */
export const approveEvent = async (eventId) => {
  try {
    const response = await api.put(`/events/${eventId}/approve`, {});
    return response.data;
  } catch (error) {
    console.error("Error approving event:", error);
    throw error;
  }
};

/**
 * Reject event
 */
export const rejectEvent = async (eventId) => {
  try {
    const response = await api.put(`/events/${eventId}/reject`, {});
    return response.data;
  } catch (error) {
    console.error("Error rejecting event:", error);
    throw error;
  }
};
