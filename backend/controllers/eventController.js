const Event = require("../models/Event");
const mongoose = require("mongoose");

// @desc    Get all events with advanced filtering
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    // Build query
    let query = {};

    // Text search (search title and description)
    // Text search using MongoDB text index (avoids ReDoS)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    // Filter by location
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    // Filter by category (supports multiple categories)
    if (req.query.category) {
      // Check if it's an array format or comma-separated string
      if (req.query.category.includes(",")) {
        const categories = req.query.category.split(",");
        query.category = { $in: categories };
      } else {
        query.category = req.query.category;
      }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.ticketPrice = {};
      if (req.query.minPrice)
        query.ticketPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        query.ticketPrice.$lte = Number(req.query.maxPrice);
    }

    // Filter by organizer
    if (req.query.organizer) {
      query.organizer = req.query.organizer;
    }

    // Filter by featured status
    if (req.query.featured) {
      query.featured = req.query.featured === "true";
    }

    // Filter by ticket availability
    if (req.query.hasTickets === "true") {
      query.availableTickets = { $gt: 0 };
    }

    // Determine sorting
    const sortOptions = {
      date: { date: 1 },
      "date-desc": { date: -1 },
      price: { ticketPrice: 1 },
      "price-desc": { ticketPrice: -1 },
      title: { title: 1 },
      popularity: { attendeeCount: -1 },
    };

    const sortBy = sortOptions[req.query.sort] || sortOptions.date;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query with pagination
    const events = await Event.find(query)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
      },
      data: events,
    });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving events",
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email phoneNumber",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error getting event:", error);

    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while retrieving event",
    });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer or Admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      ticketPrice,
      totalTickets,
      category,
    } = req.body;

    const eventData = {
      title,
      description,
      date,
      location,
      ticketPrice,
      totalTickets,
      remainingTickets: totalTickets,
      availableTickets: totalTickets,
      category,
      organizer: req.user._id,
      status: "pending", // Force status to pending
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Only organizer or admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is organizer or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "System Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // Update event
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Only organizer or admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is organizer or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "System Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};

// @desc    Search events by title
// @route   GET /api/events/search
// @access  Public
exports.searchEvents = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide a title to search",
      });
    }

    const events = await Event.find({
      title: { $regex: title, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching events",
    });
  }
};

// @desc    get events by category
// @route   GET /api/events/category/:category
// @access  Public
exports.getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const events = await Event.find({
      category: { $regex: category, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error getting events by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving events by category",
    });
  }
};

// @desc    get events by location
// @route   GET /api/events/location/:location
// @access  Public
exports.getEventsByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    const events = await Event.find({
      location: { $regex: location, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error getting events by location:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving events by location",
    });
  }
};

// @desc    get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error getting upcoming events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving upcoming events",
    });
  }
};

// @desc    get events by organizer
// @route   GET /api/events/organizers/:id/events
// @access  Public
exports.getEventsByOrganizer = async (req, res) => {
  try {
    const { id } = req.params;

    const events = await Event.find({ organizer: id });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error getting events by organizer:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving events by organizer",
    });
  }
};

// @desc    Get events by logged-in organizer with filtering/pagination
// @route   GET /api/events/organizer
// @access  Private (Organizer only)
exports.getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user._id;
    console.log(`Fetching events for organizer: ${organizerId}`);
    console.log(`Query params:`, req.query);

    // Build query - start with organizer filter
    const query = { organizer: organizerId };

    // Add filters from query parameters
    // Date filters
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    // Ticket availability filter
    if (req.query.status === "available") {
      query.remainingTickets = { $gt: 0 };
    } else if (req.query.status === "sold-out") {
      query.remainingTickets = 0;
    }

    // Sorting options
    let sortOptions = {};
    switch (req.query.sort) {
      case "date-asc":
        sortOptions = { date: 1 };
        break;
      case "date-desc":
        sortOptions = { date: -1 };
        break;
      case "title-asc":
        sortOptions = { title: 1 };
        break;
      case "title-desc":
        sortOptions = { title: -1 };
        break;
      case "price-asc":
        sortOptions = { ticketPrice: 1 };
        break;
      case "price-desc":
        sortOptions = { ticketPrice: -1 };
        break;
      case "created-desc":
        sortOptions = { createdAt: -1 };
        break;
      default:
        // Default sorting by creation date (newest first)
        sortOptions = { createdAt: -1 };
    }

    // Get total count for stats
    const total = await Event.countDocuments(query);
    console.log(`Total matching events: ${total}`);

    // Pagination handling - important for dashboard vs. list views
    const page = parseInt(req.query.page, 10) || 1;

    // Check for the "all" parameter to disable pagination
    const noLimit = req.query.all === "true";
    const limit = noLimit
      ? Number.MAX_SAFE_INTEGER
      : parseInt(req.query.limit, 10) || 10;

    console.log(`Pagination: page=${page}, limit=${limit}, noLimit=${noLimit}`);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Create pagination object
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
      eventsPerPage: limit,
      noLimit: noLimit,
    };

    // Add next/prev page info if available
    if (endIndex < total) {
      pagination.nextPage = page + 1;
    }

    if (startIndex > 0) {
      pagination.prevPage = page - 1;
    }

    // Execute query with pagination and sorting
    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit);

    console.log(`Retrieved ${events.length} events`);

    // Calculate additional stats
    let totalTickets = 0;
    let totalSold = 0;
    let totalRevenue = 0;

    events.forEach((event) => {
      totalTickets += event.totalTickets;
      const soldTickets = event.totalTickets - event.remainingTickets;
      totalSold += soldTickets;
      totalRevenue += soldTickets * event.ticketPrice;
    });

    // Return response
    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      stats: {
        totalTickets,
        totalSold,
        totalRevenue,
      },
      data: events,
    });
  } catch (error) {
    console.error("Error getting organizer events:", error);

    // Specific error handling
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format or query parameter",
        error: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error in query parameters",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while retrieving organizer events",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getSimilarEvents = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find events with same category but different id
    const similarEvents = await Event.find({
      _id: { $ne: req.params.id },
      category: event.category,
    }).limit(3);

    res.status(200).json({
      success: true,
      data: similarEvents,
    });
  } catch (error) {
    console.error("Error getting similar events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving similar events",
    });
  }
};

// @desc    Get analytics for a specific event
// @route   GET /api/events/:id/analytics
// @access  Private (Only organizer or admin)
exports.getEventAnalytics = async (req, res) => {
  try {
    const eventId = req.params.id;
    const Booking = require("../models/Booking");

    // First, verify the event exists and user has permission
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is organizer or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "System Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics for this event",
      });
    }

    // Use Aggregation Pipeline to calculate stats on the database side
    const stats = await Booking.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "Confirmed"] }, "$totalPrice", 0],
            },
          },
          ticketsSold: {
            $sum: {
              $cond: [{ $eq: ["$status", "Confirmed"] }, "$ticketsBooked", 0],
            },
          },
          confirmedBookingsCount: {
            $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
          },
          canceledBookingsCount: {
            $sum: { $cond: [{ $eq: ["$status", "Canceled"] }, 1, 0] },
          },
          totalTicketsToRefund: {
            $sum: {
              $cond: [{ $eq: ["$status", "Canceled"] }, "$ticketsBooked", 0],
            },
          },
          totalRefundAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Canceled"] }, "$totalPrice", 0],
            },
          },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // Extract stats from aggregation result (or default to 0 if no bookings)
    const result = stats[0] || {
      totalRevenue: 0,
      ticketsSold: 0,
      confirmedBookingsCount: 0,
      canceledBookingsCount: 0,
      totalTicketsToRefund: 0,
      totalRefundAmount: 0,
      totalBookings: 0,
    };

    // Fetch canceled bookings details separately (if needed for list view)
    // This is still better than fetching ALL bookings
    const canceledBookings = await Booking.find({
      event: eventId,
      status: "Canceled",
    }).populate("user", "name email");

    const canceledBookingsDetails = canceledBookings.map((booking) => ({
      id: booking._id,
      bookerName: booking.user?.name || "Unknown",
      bookerEmail: booking.user?.email || "Unknown",
      ticketsToRefund: booking.ticketsBooked,
      refundAmount: booking.totalPrice,
      originalBookingDate: booking.createdAt,
      canceledAt: booking.updatedAt,
    }));

    const averageTicketPrice =
      result.ticketsSold > 0
        ? result.totalRevenue / result.ticketsSold
        : event.ticketPrice;

    const analytics = {
      // Basic metrics
      totalRevenue: parseFloat(result.totalRevenue.toFixed(2)),
      totalBookings: result.totalBookings,
      ticketsSold: result.ticketsSold,
      averageTicketPrice: parseFloat(averageTicketPrice.toFixed(2)),

      // Bookings breakdown
      confirmedBookings: result.confirmedBookingsCount,
      canceledBookings: result.canceledBookingsCount,

      // Canceled bookings details
      canceledBookingsData: {
        totalCanceledBookings: result.canceledBookingsCount,
        totalTicketsToRefund: result.totalTicketsToRefund,
        totalRefundAmount: parseFloat(result.totalRefundAmount.toFixed(2)),
        canceledBookings: canceledBookingsDetails,
      },

      // Event details
      eventInfo: {
        totalTickets: event.totalTickets,
        remainingTickets: event.remainingTickets,
        ticketPrice: event.ticketPrice,
        eventDate: event.date,
        createdAt: event.createdAt,
      },
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error getting event analytics:", error);

    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while retrieving event analytics",
    });
  }
};

// @desc    Approve event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin only)
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = "approved";
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event approved successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving event",
    });
  }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin only)
exports.rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = "rejected";
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event rejected successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting event",
    });
  }
};
