const rateLimit = require("express-rate-limit");

// Strict limiter for login — 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for registration — 3 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many accounts created. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for password reset — 3 per 15 minutes per IP
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, passwordResetLimiter };
