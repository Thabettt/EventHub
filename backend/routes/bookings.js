const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // Fixed path from authMiddleware to auth

const {
  createSelfBooking,
  createBookingForUser,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  getAllBookings,
  getEventBookings,
  getOrganizerBookings,
  getOrganizerAttendeeBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

// User booking routes
// Create booking for self
router.post("/events/:eventId", protect, createSelfBooking);

// Get all bookings for current user
router.get("/me", protect, getUserBookings);

// Admin/Organizer routes
// Create booking for another user
router.post(
  "/admin",
  protect,
  authorize("System Admin", "Organizer"),
  createBookingForUser
);

// Get all bookings (admin only)
router.get("/admin/all", protect, authorize("System Admin"), getAllBookings);

// Get bookings for a specific event (admin or organizer)
router.get("/events/:eventId", protect, getEventBookings);

// Get bookings for all events owned by the logged-in organizer
router.get(
  "/organizer",
  protect,
  authorize("Organizer", "System Admin"),
  getOrganizerBookings
);

// Get bookings for a specific attendee scoped to this organizer
router.get(
  "/organizer/attendee/:attendeeId",
  protect,
  authorize("Organizer", "System Admin"),
  getOrganizerAttendeeBookings
);

// Update booking status (admin only)
router.put(
  "/:bookingId/status",
  protect,
  authorize("System Admin"),
  updateBookingStatus
);

// Get specific booking details (placed after specific routes to avoid parameter conflicts)
router.get("/:bookingId", protect, getBookingDetails);

// Cancel a booking
router.delete("/:bookingId", protect, cancelBooking);
module.exports = router;
