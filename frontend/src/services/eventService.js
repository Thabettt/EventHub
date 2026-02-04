import axios from "axios";

const API_URL = "http://localhost:3003/api";

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
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
    const response = await axios.get(`${API_URL}/events?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
