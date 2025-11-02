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
