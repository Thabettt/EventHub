import api from "./api";

export const getOrganizerAttendees = async () => {
  try {
    const res = await api.get("/bookings/organizer");
    return res.data;
  } catch (err) {
    console.error("Error fetching organizer attendees", err);
    throw err;
  }
};

export const getAttendeeBookings = async (attendeeId) => {
  try {
    const res = await api.get(`/bookings/organizer/attendee/${attendeeId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching attendee bookings", err);
    throw err;
  }
};

export const getOrganizerBookings = async (filters = {}) => {
  try {
    const qs = new URLSearchParams(filters).toString();
    const res = await api.get(`/bookings/organizer?${qs}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching organizer bookings", err);
    throw err;
  }
};

export const createBooking = async (eventId, bookingData) => {
  try {
    const res = await api.post(`/bookings/events/${eventId}`, bookingData);
    return res.data;
  } catch (err) {
    console.error("Error creating booking", err);
    throw err;
  }
};

export const getUserBookings = async () => {
  try {
    const res = await api.get("/bookings/me");
    return res.data;
  } catch (err) {
    console.error("Error fetching user bookings", err);
    throw err;
  }
};

export const createCheckoutSession = async (eventId, ticketsBooked) => {
  try {
    const res = await api.post("/payments/create-checkout-session", {
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
    const res = await api.get(
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
