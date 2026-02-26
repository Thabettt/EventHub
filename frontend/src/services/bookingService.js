import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003/api";

// Configured axios instance — HttpOnly cookie is sent automatically
const bookingApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getOrganizerAttendees = async () => {
  try {
    const res = await bookingApi.get("/bookings/organizer");
    return res.data;
  } catch (err) {
    console.error("Error fetching organizer attendees", err);
    throw err;
  }
};

export const getAttendeeBookings = async (attendeeId) => {
  try {
    const res = await bookingApi.get(
      `/bookings/organizer/attendee/${attendeeId}`,
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching attendee bookings", err);
    throw err;
  }
};

export const getOrganizerBookings = async (filters = {}) => {
  try {
    const qs = new URLSearchParams(filters).toString();
    const res = await bookingApi.get(`/bookings/organizer?${qs}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching organizer bookings", err);
    throw err;
  }
};

export const createBooking = async (eventId, bookingData) => {
  try {
    const res = await bookingApi.post(
      `/bookings/events/${eventId}`,
      bookingData,
    );
    return res.data;
  } catch (err) {
    console.error("Error creating booking", err);
    throw err;
  }
};

export const getUserBookings = async () => {
  try {
    const res = await bookingApi.get("/bookings/me");
    return res.data;
  } catch (err) {
    console.error("Error fetching user bookings", err);
    throw err;
  }
};

export const createCheckoutSession = async (eventId, ticketsBooked) => {
  try {
    const res = await bookingApi.post("/payments/create-checkout-session", {
      eventId,
      ticketsBooked,
    });
    return res.data;
  } catch (err) {
    console.error("Error creating checkout session", err);
    throw err;
  }
};

export const getSessionStatus = async (sessionId) => {
  try {
    const res = await bookingApi.get(
      `/payments/session-status?session_id=${sessionId}`,
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching session status", err);
    throw err;
  }
};

export default {
  getOrganizerAttendees,
  getAttendeeBookings,
  getOrganizerBookings,
  createBooking,
  getUserBookings,
  createCheckoutSession,
  getSessionStatus,
};
