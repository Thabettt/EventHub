const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Create a booking for the logged-in user
// @route   POST /api/bookings/events/:eventId
// @access  Private
exports.createSelfBooking = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id; // Get user ID from authenticated user

    // Validate the event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check for existing booking removed to allow multiple bookings per user
    // const existingBooking = await Booking.findOne({
    //   event: eventId,
    //   user: userId,
    // });

    // if (existingBooking) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You have already booked this event",
    //   });
    // }

    // Get the number of tickets from request body, default to 1 if not specified
    const { ticketsBooked = 1 } = req.body;

    // Validate ticketsBooked is a positive integer
    if (!Number.isInteger(ticketsBooked) || ticketsBooked <= 0) {
      return res.status(400).json({
        success: false,
        message: "Number of tickets must be a positive integer",
      });
    }

    // Check if enough tickets are available
    if (event.remainingTickets < ticketsBooked) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${event.remainingTickets} tickets available`,
      });
    }

    // Calculate total price
    const totalPrice = event.ticketPrice * ticketsBooked;

    // Create booking with correct fields
    const newBooking = new Booking({
      event: eventId,
      user: userId,
      ticketsBooked,
      totalPrice,
      bookingDate: new Date(),
      status: "Confirmed",
    });

    await newBooking.save();

    // Update available tickets correctly
    event.remainingTickets -= ticketsBooked;
    await event.save();

    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Admin/Organizer creates booking for another user
// @route   POST /api/bookings/admin
// @access  Private (Admin/Organizer only)
exports.createBookingForUser = async (req, res) => {
  try {
    const { eventId, userEmail, ticketsBooked = 1 } = req.body;

    // Validate ticketsBooked is a positive integer
    if (!Number.isInteger(ticketsBooked) || ticketsBooked <= 0) {
      return res.status(400).json({
        success: false,
        message: "Number of tickets must be a positive integer",
      });
    }

    // Validate the event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    // Check if enough tickets are available
    if (event.remainingTickets < ticketsBooked) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${event.remainingTickets} tickets available`,
      });
    }

    // Check if user already has a booking for this event
    const existingBooking = await Booking.findOne({
      event: eventId,
      user: user._id,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This user has already booked this event",
      });
    }

    // Calculate total price
    const totalPrice = event.ticketPrice * ticketsBooked;

    // Create a new booking
    const newBooking = new Booking({
      event: eventId,
      user: user._id,
      ticketsBooked,
      totalPrice,
      bookingDate: new Date(),
      status: "Confirmed",
      bookedBy: req.user._id, // Track who made the booking
    });

    await newBooking.save();

    // Update available tickets
    event.remainingTickets -= ticketsBooked;
    await event.save();

    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated user

    // Fetch bookings for the logged-in user
    const bookings = await Booking.find({ user: userId })
      .populate("event")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get specific booking details
// @route   GET /api/bookings/:bookingId
// @access  Private

exports.getBookingDetails = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user._id; // Get user ID from authenticated user

    // Validate the booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId)
      .populate("event")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if the logged-in user is the owner of the booking or an admin
    if (booking.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:bookingId
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user._id; // Get user ID from authenticated user

    // Validate the booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId).populate("event");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if the logged-in user is the owner of the booking or an admin
    if (booking.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    // Update remaining tickets - add back the number of tickets that were booked
    const event = await Event.findById(booking.event._id);
    event.remainingTickets += booking.ticketsBooked;
    await event.save();

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== "System Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only resource.",
      });
    }

    // Fetch all bookings with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const bookings = await Booking.find()
      .populate("event", "title date location price")
      .populate("user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ bookingDate: -1 });

    // Get total count for pagination
    const total = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
      },
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all bookings for events owned by the logged-in organizer
// @route   GET /api/bookings/organizer
// @access  Private (Organizer, System Admin)
exports.getOrganizerBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admin can view all organizer bookings if needed
    if (userRole === "System Admin") {
      const bookings = await Booking.find()
        .populate("event", "title date organizer")
        .populate("user", "name email profilePicture")
        .sort({ bookingDate: -1 });

      return res
        .status(200)
        .json({ success: true, count: bookings.length, data: bookings });
    }

    // For organizers: find bookings where the event.organizer == userId
    // First find events organized by this user
    const events = await Event.find({ organizer: userId }).select("_id title");
    const eventIds = events.map((e) => e._id);

    // Fetch bookings for those events
    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate("event", "title date organizer")
      .populate("user", "name email profilePicture")
      .sort({ bookingDate: -1 });

    return res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("Error fetching organizer bookings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get bookings for a specific attendee but only for events organized by the logged-in organizer
// @route   GET /api/bookings/organizer/attendee/:attendeeId
// @access  Private (Organizer, System Admin)
exports.getOrganizerAttendeeBookings = async (req, res) => {
  try {
    const attendeeId = req.params.attendeeId;
    const organizerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(attendeeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid attendee id" });
    }

    // Find bookings for the attendee and populate events, but only keep events belonging to this organizer
    const bookings = await Booking.find({ user: attendeeId })
      .populate({
        path: "event",
        match: { organizer: organizerId },
        select: "title date ticketPrice location organizer",
      })
      .populate("user", "name email profilePicture phoneNumber createdAt")
      .sort({ createdAt: -1 });

    const relevant = bookings.filter((b) => b.event); // only bookings for this organizer's events

    const attendee = relevant[0]?.user || null;

    return res.status(200).json({
      success: true,
      count: relevant.length,
      data: { attendee, bookings: relevant },
    });
  } catch (err) {
    console.error("Error getting organizer attendee bookings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all bookings for a specific event
// @route   GET /api/events/:eventId/bookings
// @access  Private (Admin and Organizer only)
exports.getEventBookings = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate the event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Authorization check - only admin or the organizer can see bookings
    if (
      userRole !== "System Admin" &&
      event.organizer.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins and organizers can view bookings.",
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Fetch bookings for the specific event with pagination
    const bookings = await Booking.find({ event: eventId })
      .populate("user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ bookingDate: -1 });

    // Get total count for pagination
    const total = await Booking.countDocuments({ event: eventId });

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
      },
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:bookingId/status
// @access  Private (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { status } = req.body; // New status from request body

    // Validate the booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is an admin
    if (req.user.role !== "System Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only resource.",
      });
    }

    // Validate status value
    const validStatuses = ["Confirmed", "Canceled", "Pending", "Refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Handle ticket availability if status changes to cancelled or refunded
    if (
      (status === "Canceled" || status === "Refunded") &&
      booking.status !== "Canceled" &&
      booking.status !== "Refunded"
    ) {
      // Increment available tickets back based on the number of tickets booked
      const event = await Event.findById(booking.event);
      if (event) {
        event.remainingTickets += booking.ticketsBooked;
        await event.save();
      }
    } else if (
      (booking.status === "Canceled" || booking.status === "Refunded") &&
      (status === "Confirmed" || status === "Pending")
    ) {
      // If reactivating a canceled booking, check if tickets are available
      const event = await Event.findById(booking.event);
      if (event) {
        if (event.remainingTickets < booking.ticketsBooked) {
          return res.status(400).json({
            success: false,
            message: `Cannot reactivate booking. Only ${event.remainingTickets} tickets available.`,
          });
        }
        // Decrement tickets again since booking is now active
        event.remainingTickets -= booking.ticketsBooked;
        await event.save();
      }
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Return populated booking in response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("event", "title date location")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
