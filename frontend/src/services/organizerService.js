import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Configured axios instance — HttpOnly cookie is sent automatically
const organizerApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Get dashboard data for organizer
export const getOrganizerDashboard = async () => {
  try {
    // Fetch events and bookings concurrently
    const [eventsResponse, bookingsResponse] = await Promise.all([
      organizerApi.get("/events/organizer?all=true"),
      organizerApi.get("/bookings/organizer"),
    ]);

    const events = eventsResponse.data.data;
    const bookings = bookingsResponse.data.data || [];

    // Calculate statistics from events
    const stats = calculateStats(events);

    // Get upcoming events (future date)
    const today = new Date();
    const upcomingEvents = events
      .filter((event) => new Date(event.date) > today)
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Closest upcoming first
      .map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        totalTickets: event.totalTickets,
        soldTickets: event.totalTickets - event.remainingTickets,
      }));

    // Get recent events (PAST EVENTS - not just recently created)
    const recentEvents = events
      .filter((event) => new Date(event.date) <= today) // Filter by past dates
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first
      .map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        ticketsSold: event.totalTickets - event.remainingTickets,
        revenue:
          (event.totalTickets - event.remainingTickets) * event.ticketPrice,
      }));

    // Calculate monthly revenue data based on booking dates
    const revenueData = calculateRevenueByBookingMonth(bookings);

    return {
      stats,
      revenueData,
      recentEvents,
      upcomingEvents,
    };
  } catch (error) {
    console.error("Error fetching organizer dashboard:", error);
    throw error;
  }
};

// Get all events for organizer with optional filtering
export const getOrganizerEvents = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    queryParams.append("all", "true"); // Always fetch all events for the organizer
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await organizerApi.get(
      `/events/organizer?${queryParams.toString()}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await organizerApi.post("/events", eventData);
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await organizerApi.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const response = await organizerApi.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Helper function to calculate dashboard stats
const calculateStats = (events) => {
  let totalEvents = events.length;
  let totalRevenue = 0;
  let totalTicketsSold = 0;
  let upcomingEvents = 0;
  const today = new Date();

  events.forEach((event) => {
    const soldTickets = event.totalTickets - event.remainingTickets;
    totalTicketsSold += soldTickets;
    totalRevenue += soldTickets * event.ticketPrice;

    if (new Date(event.date) > today) {
      upcomingEvents++;
    }
  });

  return {
    totalEvents,
    totalTicketsSold,
    totalRevenue,
    upcomingEvents,
  };
};

// Helper function to calculate monthly revenue and tickets based on booking dates
const calculateRevenueByBookingMonth = (bookings) => {
  const monthlyData = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize monthlyData with zeros for all months
  months.forEach((month) => {
    monthlyData[month] = {
      revenue: 0,
      ticketsSold: 0,
      freeTicketsSold: 0,
    };
  });

  // Calculate revenue and tickets for each month based on booking dates
  bookings.forEach((booking) => {
    if (booking.status === "Confirmed") {
      // Only count confirmed bookings
      const bookingDate = new Date(booking.bookingDate || booking.createdAt);
      const month = months[bookingDate.getMonth()];

      monthlyData[month].revenue += booking.totalPrice || 0;
      monthlyData[month].ticketsSold += booking.ticketsBooked || 0;

      // Track free tickets (when totalPrice is 0 but tickets were booked)
      if ((booking.totalPrice || 0) === 0 && (booking.ticketsBooked || 0) > 0) {
        monthlyData[month].freeTicketsSold += booking.ticketsBooked || 0;
      }
    }
  });

  // Convert to array format for chart
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    ticketsSold: data.ticketsSold,
    freeTicketsSold: data.freeTicketsSold,
  }));
};

export default {
  getOrganizerDashboard,
  getOrganizerEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
