const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlacklistedToken = require("../models/BlacklistedToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = require("../utils/emailService");

// @desc    Register new user
// @route   POST /auth/register
// @access  Public

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 100 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    // --- End input validation ---

    console.log("Registration attempt:", { name, email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Registration could not be completed. Please try a different email.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Creating new user...");

    // Create new user - SECURITY: Hardcode role to prevent privilege escalation
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Standard User", // Always force standard user for public registration
    });

    console.log("User created in database:", user._id);

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error details:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Guard against missing or malformed Authorization header
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid token provided",
      });
    }

    const token = req.headers.authorization.split(" ")[1];

    // Decode token to get expiry time (without verifying)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Add token to blacklist until its natural expiration
    await BlacklistedToken.create({
      token,
      expiresAt: new Date(decoded.exp * 1000), // Convert from unix timestamp to Date
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  let user;
  try {
    const { email } = req.body;

    // Check if user exists
    user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate reset token (random bytes)
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Create reset URL - DEFINE THIS BEFORE USING IT
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Create email message
    const message = {
      from: '"EventHub" <noreply@eventhub.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>You requested a password reset</h1>
        <p>Please click on the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    };

    // Save the user with the reset token information
    await user.save();

    try {
      // Try to send email
      await transporter.sendMail(message);

      return res.status(200).json({
        success: true,
        message: "Email sent",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);

    // If there's an error, remove reset token fields
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }

    return res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Get token from params and convert it to hashed version for database comparison
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    // Check if user exists and token is valid
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Validate new password
    if (
      !req.body.password ||
      typeof req.body.password !== "string" ||
      req.body.password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Set new password and hash it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user
    await user.save();

    // Return success
    res.status(200).json({
      success: true,
      message: "Password successfully reset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};
