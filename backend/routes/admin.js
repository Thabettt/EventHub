// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardData,
  getEventsAnalytics,
  getBookingsAnalytics,
  getUsersAnalytics,
  getRevenueAnalytics,
} = require("../controllers/adminController");

// All routes require authentication and admin role
router.use(protect, authorize("System Admin"));

// Dashboard summary data
router.get("/dashboard", getDashboardData);

// Detailed analytics
router.get("/analytics/events", getEventsAnalytics);
router.get("/analytics/bookings", getBookingsAnalytics);
router.get("/analytics/users", getUsersAnalytics);
router.get("/analytics/revenue", getRevenueAnalytics);

module.exports = router;
