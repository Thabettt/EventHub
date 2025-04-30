const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/auth");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getEventsByCategory,
  getEventsByLocation,
  getUpcomingEvents,
  getEventsByOrganizer,
  getOrganizerEvents,
  getSimilarEvents, // Added missing import
} = require("../controllers/eventController");

const { getEventBookings } = require("../controllers/bookingController");

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
router.get("/", getEvents);

// SPECIFIC ROUTES FIRST - before wildcard routes
// @desc    Search events
// @route   GET /api/v1/events/search
// @access  Public
router.get("/search", searchEvents);

// @desc    Get events by category
// @route   GET /api/v1/events/category/:category
// @access  Public
router.get("/category/:category", getEventsByCategory);

// @desc    Get events by location
// @route   GET /api/v1/events/location/:location
// @access  Public
router.get("/location/:location", getEventsByLocation);

// @desc    Get upcoming events
// @route   GET /api/v1/events/upcoming
// @access  Public
router.get("/upcoming", getUpcomingEvents);

// @desc    Get events by logged-in organizer
// @route   GET /api/events/organizer
// @access  Private (Organizer only)
router.get("/organizer", protect, authorize("Organizer"), getOrganizerEvents);

// @desc    Get events by organizer
// @route   GET /api/v1/events/organizer/:organizerId
// @access  Public
router.get("/organizer/:organizerId", getEventsByOrganizer);

// @desc    Get similar events
// @route   GET /api/v1/events/similar/:id
// @access  Public
router.get("/similar/:id", getSimilarEvents); // MOVED THIS ROUTE BEFORE THE WILDCARD ROUTE

// @desc    Get bookings for a specific event
// @route   GET /api/events/:eventId/bookings
// @access  Private (Admin and Organizer only)
router.get(
  "/:eventId/bookings",
  protect,
  authorize("Organizer", "System Admin"),
  getEventBookings
);

// WILDCARD ROUTES LAST
// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
router.get("/:id", getEvent);

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private
router.post("/", protect, authorize("System Admin", "Organizer"), createEvent);

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private
router.put(
  "/:id",
  protect,
  authorize("System Admin", "Organizer"),
  updateEvent
);

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private
router.delete(
  "/:id",
  protect,
  authorize("System Admin", "Organizer"),
  deleteEvent
);

module.exports = router;
