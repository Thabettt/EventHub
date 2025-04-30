const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authcontroller");
const { protect } = require("../middleware/auth");
const transporter = require("../utils/emailService"); // Add this import!

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", protect, logout);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.put("/reset-password/:resetToken", resetPassword);

// Add this route to your auth.js routes file
router.post("/test-email", async (req, res) => {
  try {
    const testMessage = {
      from: '"EventHub Test" <noreply@eventhub.com>',
      to: req.body.email || process.env.EMAIL_USERNAME,
      subject: "Testing Email Configuration",
      html: "<h1>Email Test</h1><p>If you received this, your email configuration is working!</p>",
    };

    await transporter.sendMail(testMessage);

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;
