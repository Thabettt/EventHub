import axios from "axios";

const API_URL = "http://localhost:3003/api";

export const getOrganizerAttendees = async (token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // New backend endpoint returns bookings for events the organizer hosts.
    // We'll return the bookings array; frontend components expect either an array or { data: [...] }
    const res = await axios.get(`${API_URL}/bookings/organizer`, config);
    return res.data; // expected { data: [...] } or array
  } catch (err) {
    console.error("Error fetching organizer attendees", err);
    throw err;
  }
};

export const getAttendeeBookings = async (token, attendeeId) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(
      `${API_URL}/bookings/organizer/attendee/${attendeeId}`,
      config
    );
    return res.data; // expected { data: [...] }
  } catch (err) {
    console.error("Error fetching attendee bookings", err);
    throw err;
  }
};

export const getOrganizerBookings = async (token, filters = {}) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const qs = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API_URL}/bookings/organizer?${qs}`, config);
    return res.data;
  } catch (err) {
    console.error("Error fetching organizer bookings", err);
    throw err;
  }
};

export const createBooking = async (token, eventId, bookingData) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.post(
      `${API_URL}/bookings/events/${eventId}`,
      bookingData,
      config
    );
    return res.data;
  } catch (err) {
    console.error("Error creating booking", err);
    throw err;
  }
};

export const getUserBookings = async (token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${API_URL}/bookings/me`, config);
    return res.data;
  } catch (err) {
    console.error("Error fetching user bookings", err);
    throw err;
  }
};

export default {
  getOrganizerAttendees,
  getAttendeeBookings,
  getOrganizerBookings,
  createBooking,
  getUserBookings,
};
