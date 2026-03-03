const logger = require("./utils/logger");
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const uploadRoutes = require("./routes/upload");
const paymentRoutes = require("./routes/payments");
const { handleWebhook } = require("./controllers/paymentController");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_CLIENT_ID",
  "EMAIL_USERNAME",
  "EMAIL_PASSWORD",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(
    `FATAL: Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Set security headers
app.use(helmet());

// Compression for API responses and static files
const compression = require("compression");
app.use(compression());

// Parse cookies
app.use(cookieParser());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// HTTP request logger middleware integrated with Winston
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

const connectWithRetry = async () => {
  try {
    await connectDB();
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    logger.info("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Stripe webhook — MUST be before express.json() (needs raw body for signature verification)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// Limit payload size to prevent DoS attacks
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ limit: "100kb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);

// No static frontend serving in this split deployment configuration

// Global error handling — use centralized handler
const errorHandler = require("./middleware/error");
app.use(errorHandler);

// Start the server
const server = app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

// Health check endpoint for load balancers and monitoring
const mongoose = require("mongoose");
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const isDbReady = dbState === 1;
  const status = isDbReady ? "ok" : "degraded";
  const httpCode = isDbReady ? 200 : 503;

  res.status(httpCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDbReady ? "connected" : "disconnected",
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    mongoose.connection.close(false).then(() => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Graceful shutdown
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Exit immediately (process state is compromised)
  process.exit(1);
});
