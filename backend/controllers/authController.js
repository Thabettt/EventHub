const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");
const transporter = require("../utils/emailService");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ACCESS_TOKEN_EXPIRY = "15m";
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper: cookie options
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
    path: "/",
  };
};

// Helper: issue access + refresh tokens, set both as HttpOnly cookies
const sendTokens = async (res, user) => {
  // 1. Access token (short-lived JWT)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

  // 2. Refresh token (crypto random, stored hashed in DB)
  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  // Remove any existing refresh tokens for this user (one session per user)
  await RefreshToken.deleteMany({ user: user._id });

  // Store hashed refresh token
  await RefreshToken.create({
    token: hashedRefreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  // 3. Set cookies
  res.cookie("token", accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie(
    "refreshToken",
    rawRefreshToken,
    getCookieOptions(REFRESH_TOKEN_EXPIRY_MS),
  );

  return accessToken;
};

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

    // Create new user - SECURITY: Hardcode role to prevent privilege escalation
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Standard User", // Always force standard user for public registration
    });

    // Issue access + refresh tokens
    await sendTokens(res, user);
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Registration error details:", error);
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

    // Issue access + refresh tokens
    await sendTokens(res, user);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Delete refresh token from DB for this user
    if (req.user) {
      await RefreshToken.deleteMany({ user: req.user._id });
    }

    // Clear both cookies
    const clearOpts = getCookieOptions(0);
    res.clearCookie("token", clearOpts);
    res.clearCookie("refreshToken", clearOpts);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error:", error);
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
      logger.error("Email sending failed:", emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    logger.error("Forgot password error:", error);

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
    logger.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// @desc    Authenticate with Google OAuth
// @route   POST /auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email already exists (local account -> link)
      user = await User.findOne({ email });
      if (user) {
        // Link Google account to existing local user
        user.googleId = googleId;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
      } else {
        // Brand new Google user
        user = await User.create({
          googleId,
          name,
          email,
          profilePicture: picture || "",
          authProvider: "google",
          role: "Standard User",
        });
      }
    }

    // Issue access + refresh tokens
    await sendTokens(res, user);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /auth/refresh
// @access  Public (refresh cookie is the credential)
exports.refreshToken = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    // Hash the incoming token and look it up
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const storedToken = await RefreshToken.findOne({ token: hashedToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token invalid or expired — clear cookies
      const clearOpts = getCookieOptions(0);
      res.clearCookie("token", clearOpts);
      res.clearCookie("refreshToken", clearOpts);
      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid. Please log in again.",
      });
    }

    // Token is valid — look up the user
    const user = await User.findById(storedToken.user).select("-password");
    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Issue a new access token only (refresh token stays the same)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    res.cookie("token", accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
};
