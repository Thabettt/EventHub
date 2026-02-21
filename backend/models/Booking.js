const mongoose = require("mongoose");

// Define the Booking schema
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Reference to the Event model
      required: true,
    },
    ticketsBooked: {
      type: Number,
      required: true,
      min: 1, // At least one ticket must be booked
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0, // Total price cannot be negative
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Canceled"], // Allowed statuses
      default: "Pending", // Default status
    },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "paid", "refunded"],
      default: "none",
    },
    stripeSessionId: {
      type: String,
      default: "",
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
  { collection: "bookings" },
);

// Create the Booking model
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
