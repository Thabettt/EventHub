const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    tickets: [
      {
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        description: String,
        isEarlyBird: Boolean,
        earlyBirdPrice: Number,
        earlyBirdEndDate: Date,
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "published"],
      default: "pending",
    },
    maxAttendees: {
      type: Number,
      default: null,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    allowWaitlist: {
      type: Boolean,
      default: true,
    },
    refundPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "flexible",
    },
    additionalInfo: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    attendeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
