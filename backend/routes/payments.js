const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createCheckoutSession,
  getSessionStatus,
} = require("../controllers/paymentController");

// @desc    Create a Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
router.post("/create-checkout-session", protect, createCheckoutSession);

// @desc    Get the status of a Checkout Session
// @route   GET /api/payments/session-status
// @access  Private
router.get("/session-status", protect, getSessionStatus);

// NOTE: The webhook route is registered directly in server.js
// because it needs express.raw() middleware (raw body for signature verification)

module.exports = router;
