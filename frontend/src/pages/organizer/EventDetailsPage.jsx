import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.baseURL = `http://localhost:3003`;
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Components
import Footer from "../../components/layout/Footer";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

// Context
import { AuthContext } from "../../context/AuthContext";

// Mock data for development/fallback
const MOCK_EVENT = {
  _id: "mock123",
  title: "Annual Tech Conference 2024",
  description: `Join us for the biggest technology conference of the year! This comprehensive event brings together industry leaders, innovative startups, and tech enthusiasts from around the globe.

Features:
• 20+ Expert speakers from top tech companies
• Interactive workshops and hands-on sessions
• Networking opportunities with 500+ attendees
• Latest trends in AI, Web3, and Cloud Computing
• Startup pitch competition with $50,000 in prizes
• Career fair with 30+ recruiting companies

Don't miss this opportunity to expand your network, learn cutting-edge technologies, and shape the future of innovation!`,
  date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
  location: "San Francisco Convention Center, 747 Howard St, San Francisco, CA",
  category: "Technology",
  image:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
  ticketPrice: 299.99,
  totalTickets: 500,
  remainingTickets: 127,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
  updatedAt: new Date().toISOString(),
  organizer: "mock-organizer-id",
};

const MOCK_BOOKINGS = [
  {
    _id: "booking1",
    user: {
      name: "John Smith",
      email: "john.smith@email.com",
    },
    ticketsBooked: 2,
    totalPrice: 599.98,
    bookingDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "confirmed",
  },
  {
    _id: "booking2",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
    },
    ticketsBooked: 1,
    totalPrice: 299.99,
    bookingDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "confirmed",
  },
];

const MOCK_ANALYTICS = {
  totalRevenue: 112497.25,
  totalBookings: 373,
  ticketsSold: 373,
  averageTicketPrice: 299.99,
  conversionRate: 12.4,
  refundRequests: 2,
};

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format relative date
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Calculate time remaining until event
  const calculateTimeRemaining = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const timeRemaining = eventTime - now;

    if (timeRemaining <= 0) {
      return { expired: true };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    return {
      days,
      hours,
      minutes,
      expired: false,
    };
  };

  // Get event status
  const getEventStatus = () => {
    if (!event) return { status: "unknown", color: "gray" };

    const now = new Date();
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > now;
    const isPast = eventDate < now;
    const isSoldOut = event.remainingTickets === 0;

    if (isPast) return { status: "completed", color: "gray" };
    if (isSoldOut) return { status: "sold out", color: "red" };
    if (isUpcoming) return { status: "active", color: "green" };
    return { status: "draft", color: "yellow" };
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching event details for ID: ${id}`);
        console.log("Current user:", user);

        // Get auth token
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch event details
        console.log("Fetching event data...");
        const eventResponse = await axios.get(`/api/events/${id}`, { headers });
        const eventData = eventResponse.data.data || eventResponse.data;
        console.log("Event data received:", eventData);

        // For development - skip organizer check if user is not loaded yet
        // In production, you might want to handle this differently
        if (
          user &&
          eventData.organizer !== user?.id &&
          user?.role !== "admin"
        ) {
          toast.error("You do not have permission to view this event");
          navigate("/organizer/events");
          return;
        }

        setEvent(eventData);

        // Fetch bookings for this event
        try {
          console.log("Fetching bookings...");
          const bookingsResponse = await axios.get(
            `/api/bookings/event/${id}`,
            { headers }
          );
          const bookingsData =
            bookingsResponse.data.data || bookingsResponse.data;
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          console.log("Bookings data:", bookingsData);
        } catch (bookingError) {
          console.warn("Could not fetch bookings:", bookingError);
          if (bookingError.response?.status === 404) {
            console.log("Bookings endpoint not found - using empty array");
          }
          setBookings([]);
        }

        // Fetch analytics
        try {
          console.log("Fetching analytics...");
          const analyticsResponse = await axios.get(
            `/api/events/${id}/analytics`,
            { headers }
          );
          const analyticsData =
            analyticsResponse.data.data || analyticsResponse.data;
          setAnalytics(analyticsData);
          console.log("Analytics data:", analyticsData);
        } catch (analyticsError) {
          console.warn("Could not fetch analytics:", analyticsError);
          if (analyticsError.response?.status === 404) {
            console.log(
              "Analytics endpoint not found - calculating basic analytics"
            );
          }
          // Calculate basic analytics from available data
          const ticketsSold =
            eventData.totalTickets - eventData.remainingTickets;
          const revenue = ticketsSold * eventData.ticketPrice;
          setAnalytics({
            totalRevenue: revenue,
            totalBookings: ticketsSold,
            ticketsSold: ticketsSold,
            averageTicketPrice: eventData.ticketPrice,
            conversionRate: (
              (ticketsSold / eventData.totalTickets) *
              100
            ).toFixed(1),
            refundRequests: 0,
          });
        }

        console.log("Setting loading to false");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event data:", err);

        // Check if it's specifically the main event fetch that failed
        if (
          err.config?.url?.includes("/api/events/") &&
          !err.config?.url?.includes("/analytics") &&
          !err.config?.url?.includes("/bookings")
        ) {
          // Main event API failed
          if (err.response?.status === 401) {
            toast.error("Please log in to continue");
            navigate("/login");
            return;
          }

          if (err.response?.status === 404) {
            toast.error("Event not found");
            navigate("/organizer/events");
            return;
          }

          // For development - use mock data if main API fails
          if (
            process.env.NODE_ENV !== "production" ||
            err.code === "ECONNREFUSED" ||
            err.code === "ERR_NETWORK"
          ) {
            console.log(
              "Main event API failed, using mock data for development"
            );
            setEvent(MOCK_EVENT);
            setBookings(MOCK_BOOKINGS);
            setAnalytics(MOCK_ANALYTICS);
            setLoading(false);
            return;
          }

          setError("Failed to load event details. Please try again later.");
        } else {
          // Some other error occurred, but we might still have event data
          console.log(
            "Non-critical error occurred, continuing with available data"
          );
        }

        setLoading(false);
      }
    };

    // Always try to fetch data if we have an ID, don't wait for user
    if (id) {
      fetchEventData();
    }
  }, [id, navigate]); // Removed user dependency

  const handleDeleteEvent = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event deleted successfully");
      navigate("/organizer/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCopyEventLink = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success("Event link copied to clipboard!");
  };

  const handleShareEvent = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    const shareText = `Check out this amazing event: ${event?.title}`;

    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: shareText,
        url: eventUrl,
      });
    } else {
      handleCopyEventLink();
    }
  };

  const eventStatus = getEventStatus();
  const timeRemaining = event
    ? calculateTimeRemaining(event.date)
    : { expired: true };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex items-center justify-center h-[70vh]">
          <LoadingSpinner size="lg" message="Loading event details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <svg
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Error Loading Event
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link
                to="/organizer/events"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Events
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {event && (
        <motion.div
          className="pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero section with event image */}
          <div className="relative">
            <div className="w-full h-72 sm:h-96 md:h-[450px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    event.image ||
                    "https://via.placeholder.com/1200x800?text=No+Image"
                  })`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
              </div>
              <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={
                  event.image ||
                  "https://via.placeholder.com/600x400?text=No+Image"
                }
                alt={event.title}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-md"
                style={{ maxHeight: "80%" }}
              />
            </div>

            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  eventStatus.color === "green"
                    ? "bg-green-500 text-white"
                    : eventStatus.color === "red"
                    ? "bg-red-500 text-white"
                    : eventStatus.color === "yellow"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-500 text-white"
                }`}
              >
                {eventStatus.status}
              </span>
            </div>

            {/* Navigation breadcrumb */}
            <div className="absolute top-4 left-4">
              <Link
                to="/organizer/events"
                className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-white"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Events
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
              <div className="p-6 sm:p-10">
                {/* Header section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 text-indigo-800 text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Organizer Dashboard
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {event.title}
                    </h1>

                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 mr-2 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 mr-2 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 flex flex-col space-y-3">
                    <div className="flex space-x-3">
                      <Link
                        to={`/organizer/events/${id}/edit`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Event
                      </Link>

                      <button
                        onClick={handleShareEvent}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        Share
                      </button>
                    </div>

                    <Link
                      to={`/events/${id}`}
                      target="_blank"
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View Public Page
                    </Link>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {event.totalTickets - event.remainingTickets}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Tickets Sold
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {formatCurrency(analytics?.totalRevenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Revenue
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {Math.round(
                        ((event.totalTickets - event.remainingTickets) /
                          event.totalTickets) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Sold Out
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {timeRemaining.expired ? 0 : timeRemaining.days}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Days Left
                    </div>
                  </div>
                </div>

                {/* Tabs navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-8 transition-colors">
                  <div className="flex space-x-8">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "bookings", label: "Bookings" },
                      { id: "analytics", label: "Analytics" },
                      { id: "settings", label: "Settings" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="mb-8">
                  {activeTab === "overview" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Event Description
                        </h2>
                        <div className="prose max-w-none dark:prose-invert">
                          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Event Details
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Date & Time
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Location
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {event.location}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Category
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {event.category}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Ticket Price
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {formatCurrency(event.ticketPrice)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Ticket Sales
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Total Tickets
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {event.totalTickets}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Sold
                              </span>
                              <span className="font-semibold text-green-600">
                                {event.totalTickets - event.remainingTickets}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Remaining
                              </span>
                              <span className="font-semibold text-blue-600">
                                {event.remainingTickets}
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    ((event.totalTickets -
                                      event.remainingTickets) /
                                      event.totalTickets) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>

                            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {Math.round(
                                ((event.totalTickets - event.remainingTickets) /
                                  event.totalTickets) *
                                  100
                              )}
                              % sold
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "bookings" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                          Event Bookings
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Total: {bookings.length} bookings
                        </div>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <svg
                            className="h-16 w-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                            No bookings yet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Bookings will appear here once people start
                            registering for your event.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking, index) => (
                            <div
                              key={booking._id || index}
                              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                    {booking.user?.name || "Unknown User"}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {booking.user?.email || "No email"}
                                  </p>
                                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Tickets
                                      </span>
                                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {booking.ticketsBooked || 1}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Total
                                      </span>
                                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {formatCurrency(
                                          booking.totalPrice || 0
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Status
                                      </span>
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {booking.status || "confirmed"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Booked
                                      </span>
                                      <p className="text-sm text-gray-800 dark:text-gray-100">
                                        {booking.bookingDate
                                          ? formatRelativeDate(
                                              booking.bookingDate
                                            )
                                          : "Recently"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "analytics" && (
                    <div className="space-y-8">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Event Analytics
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100">Total Revenue</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(analytics?.totalRevenue || 0)}
                              </p>
                            </div>
                            <svg
                              className="h-8 w-8 text-green-200"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100">Total Bookings</p>
                              <p className="text-2xl font-bold">
                                {analytics?.totalBookings || bookings.length}
                              </p>
                            </div>
                            <svg
                              className="h-8 w-8 text-blue-200"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100">
                                Avg. Ticket Price
                              </p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(
                                  analytics?.averageTicketPrice ||
                                    event.ticketPrice
                                )}
                              </p>
                            </div>
                            <svg
                              className="h-8 w-8 text-purple-200"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100">Completion Rate</p>
                              <p className="text-2xl font-bold">
                                {Math.round(
                                  ((event.totalTickets -
                                    event.remainingTickets) /
                                    event.totalTickets) *
                                    100
                                )}
                                %
                              </p>
                            </div>
                            <svg
                              className="h-8 w-8 text-orange-200"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Performance Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Tickets Sold
                            </span>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                              {event.totalTickets - event.remainingTickets} /{" "}
                              {event.totalTickets}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Revenue per Ticket
                            </span>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                              {formatCurrency(event.ticketPrice)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Event Created
                            </span>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                              {formatRelativeDate(event.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div className="space-y-8">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Event Management
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Quick Actions
                          </h3>
                          <div className="space-y-3">
                            <Link
                              to={`/organizer/events/${id}/edit`}
                              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit Event Details
                            </Link>

                            <button
                              onClick={handleCopyEventLink}
                              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Copy Event Link
                            </button>

                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete Event
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg transition-colors">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Event Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Event ID
                              </span>
                              <p className="font-mono text-sm text-gray-800 dark:text-gray-100">
                                {event._id}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Created
                              </span>
                              <p className="text-sm text-gray-800 dark:text-gray-100">
                                {formatDate(event.createdAt)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Last Updated
                              </span>
                              <p className="text-sm text-gray-800 dark:text-gray-100">
                                {formatDate(event.updatedAt)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Public URL
                              </span>
                              <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                                /events/{event._id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                  <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteModal(false)}
                  />

                  <motion.div
                    className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 rounded-lg shadow-xl relative z-[60] transition-colors"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center mb-4">
                      <svg
                        className="h-6 w-6 text-red-500 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Delete Event
                      </h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Are you sure you want to delete "{event.title}"? This
                      action cannot be undone. All bookings and data associated
                      with this event will be permanently removed.
                    </p>

                    <div className="flex justify-end space-x-3">
                      <button
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center transition-colors ${
                          isDeleting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        onClick={handleDeleteEvent}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Event
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetailsPage;
