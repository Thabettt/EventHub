// backend/controllers/adminController.js
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const User = require("../models/User");

// @desc    Get admin dashboard summary data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardData = async (req, res) => {
  try {
    // Get counts of key entities
    const eventCount = await Event.countDocuments();
    const userCount = await User.countDocuments();
    const organizerCount = await User.countDocuments({ role: "Organizer" });
    const bookingCount = await Booking.countDocuments();

    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title date location ticketPrice totalTickets availableTickets remainingTickets category");

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ bookingDate: -1 })
      .limit(5)
      .populate("event", "title")
      .populate("user", "name email");

    // Get revenue summary
    const bookings = await Booking.find({ status: "confirmed" }).populate(
      "event",
      "price"
    );

    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.event?.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          events: eventCount,
          users: userCount,
          organizers: organizerCount,
          bookings: bookingCount,
          revenue: totalRevenue,
        },
        recentEvents,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get events analytics
// @route   GET /api/admin/analytics/events
// @access  Private (Admin only)
exports.getEventsAnalytics = async (req, res) => {
  try {
    // Get events by category
    const eventsByCategory = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Get events by month
    const eventsByMonth = await Event.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get most popular events (by bookings)
    const popularEvents = await Event.find()
      .sort({ attendeeCount: -1 })
      .limit(10)
      .select("title date location attendeeCount");

    res.status(200).json({
      success: true,
      data: {
        eventsByCategory,
        eventsByMonth,
        popularEvents,
      },
    });
  } catch (error) {
    console.error("Events analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get bookings analytics
// @route   GET /api/admin/analytics/bookings
// @access  Private (Admin only)

exports.getBookingsAnalytics = async (req, res) => {
  try {
    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get bookings by month
    const bookingsByMonth = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$bookingDate" },
            year: { $year: "$bookingDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingsByStatus,
        bookingsByMonth,
      },
    });
  } catch (error) {
    console.error("Bookings analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get users analytics
// @route   GET /api/admin/analytics/users
// @access  Private (Admin only)

exports.getUsersAnalytics = async (req, res) => {
  try {
    // Get users by registration date (monthly)
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get most active users (by bookings)
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "user",
          as: "bookings",
        },
      },
      { $unwind: "$bookings" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        usersByMonth,
        activeUsers,
      },
    });
  } catch (error) {
    console.error("Users analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private (Admin only)

exports.getRevenueAnalytics = async (req, res) => {
  try {
    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: {
            month: { $month: "$bookingDate" },
            year: { $year: "$bookingDate" },
          },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: revenueByMonth,
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
