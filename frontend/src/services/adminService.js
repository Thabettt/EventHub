import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

// Configured axios instance — HttpOnly cookie is sent automatically
const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async () => {
  try {
    const response = await adminApi.get("/admin/dashboard");
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
    const response = await adminApi.get("/admin/analytics/events");
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
    const response = await adminApi.get("/admin/analytics/bookings");
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
    const response = await adminApi.get("/admin/analytics/users");
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
    const response = await adminApi.put(`/events/${eventId}/approve`, {});
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
    const response = await adminApi.put(`/events/${eventId}/reject`, {});
    return response.data;
  } catch (error) {
    console.error("Error rejecting event:", error);
    throw error;
  }
};
