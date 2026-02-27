import api from "./api";

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

/**
 * Get all events with optional filters
 * @param {Object} filters - Query parameters (page, limit, sort, etc.)
 */
export const getEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/events?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
