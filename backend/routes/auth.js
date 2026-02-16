const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");

// Register route (rate limited)
router.post("/register", registerLimiter, register);

// Login route (rate limited)
router.post("/login", loginLimiter, login);

// Logout route
router.post("/logout", protect, logout);

// Forgot password route (rate limited)
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

// Reset password route
router.put("/reset-password/:resetToken", resetPassword);

// NOTE: /test-email route removed — it was an unauthenticated email relay (Critical vulnerability)

module.exports = router;
