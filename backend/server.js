const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const cors = require("cors");

dotenv.config();

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    credentials: true,
  }),
);

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

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

// Increase payload size limit to handle base64 encoded images (50MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Test route
app.get("/", (req, res) => {
  res.send("Hello World");
});
