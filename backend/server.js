const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const uploadRoutes = require("./routes/upload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config();

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Set security headers
app.use(helmet());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable CORS for frontend requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Only log requests in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
  });
}

const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Limit payload size to prevent DoS attacks
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ limit: "100kb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);

// Global error handling — use centralized handler
const errorHandler = require("./middleware/error");
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Test route
app.get("/", (req, res) => {
  res.send("Hello World");
});
