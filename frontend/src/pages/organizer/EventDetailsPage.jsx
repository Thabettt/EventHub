import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Button from "../../components/common/Button";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const tabRefs = useRef([]);

  // Native JavaScript date formatting functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // If it's just a time string like "14:30"
    if (timeString.includes(":") && !timeString.includes("T")) {
      return timeString;
    }
    // If it's a full datetime string
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get active tab dimensions for highlighter
  const getActiveTabDimensions = () => {
    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabRef = tabRefs.current[activeTabIndex];

    if (!activeTabRef) {
      return { width: 0, left: 0 };
    }

    const tabRect = activeTabRef.getBoundingClientRect();
    const containerRect = activeTabRef.parentElement.getBoundingClientRect();

    return {
      width: tabRect.width,
      left: tabRect.left - containerRect.left,
    };
  };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "bookings", label: "Bookings", icon: "👥" },
    { id: "cancellations", label: "Cancellations", icon: "❌" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCopyEventLink = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success("Event link copied to clipboard!");
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event deleted successfully");
      navigate("/organizer/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch event details
        console.log("Fetching event details for ID:", id);
        const eventResponse = await axios.get(`/api/events/${id}`, { headers });
        const eventData = eventResponse.data.data || eventResponse.data;
        console.log("Event data:", eventData);

        if (!eventData) {
          toast.error("Event not found");
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
            totalBookings: ticketsSold, // Simplified assumption
            ticketsSold: ticketsSold,
            averageTicketPrice: eventData.ticketPrice,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        if (error.response?.status === 401) {
          toast.error("Please log in again");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. This event may not belong to you.");
          navigate("/organizer/events");
        } else if (error.response?.status === 404) {
          toast.error("Event not found");
          navigate("/organizer/events");
        } else {
          toast.error("Failed to load event details");
        }
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      {event && (
        <motion.div
          className="pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero section with event image - Executive Style */}
          <div className="relative h-96 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-gray-900/60 to-indigo-900/80 backdrop-blur-sm z-10" />
            <img
              src={event.image || "/default-event.jpg"}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) =>
                console.log("Image failed to load:", event.image, e)
              }
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-8">
              {/* Top Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="back">Back to Events</Button>

                <div className="flex items-center space-x-4">
                  <span
                    className={`px-4 py-2 rounded-2xl text-sm font-black ${getStatusBadgeClasses(
                      event.status
                    )}`}
                  >
                    {event.status === "active" ? "🟢 Active" : "🔴 Inactive"}
                  </span>

                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-white font-bold text-sm">
                      {event.views || 0} views
                    </span>
                  </div>
                </div>
              </div>
              {/* Hero Content */}
              <div className="max-w-4xl">
                <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center space-x-6 mb-8">
                  <div className="flex items-center space-x-2 text-white/90">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-bold">
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-bold">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span className="font-bold">
                      {formatCurrency(event.ticketPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Navigation Tabs */}
          <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="relative flex">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    className="relative"
                  >
                    <Button
                      onClick={() => setActiveTab(tab.id)}
                      variant="solid"
                      size="default"
                      className={`group relative flex items-center space-x-3 !px-8 !py-6 font-black !text-sm transition-all duration-300 z-10 !shadow-none ${
                        activeTab === tab.id
                          ? "!text-white !bg-transparent"
                          : "!text-gray-600 dark:!text-gray-300 hover:!text-gray-900 dark:hover:!text-white !bg-transparent"
                      }`}
                    >
                      <div className="relative flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            activeTab === tab.id
                              ? "bg-white/20 backdrop-blur-sm"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span
                            className={`text-sm transition-colors duration-300 ${
                              activeTab === tab.id ? "text-white" : ""
                            }`}
                          >
                            {tab.icon}
                          </span>
                        </div>
                        <span>{tab.label}</span>
                      </div>
                    </Button>
                  </div>
                ))}

                {/* Animated sliding background */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-lg pointer-events-none -mt-6"
                  initial={false}
                  animate={{
                    x: getActiveTabDimensions().left,
                    width: getActiveTabDimensions().width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.3,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl p-8">
              {activeTab === "analytics" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Executive Analytics
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-bold">
                        Comprehensive performance insights
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">📊</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xl">💰</span>
                          </div>
                        </div>
                        <div className="text-3xl font-black mb-2">
                          {formatCurrency(analytics?.totalRevenue || 0)}
                        </div>
                        <div className="text-emerald-100 font-bold text-lg">
                          Total Revenue
                        </div>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xl">👥</span>
                          </div>
                        </div>
                        <div className="text-3xl font-black mb-2">
                          {analytics?.totalBookings || 0}
                        </div>
                        <div className="text-blue-100 font-bold text-lg">
                          Total Bookings
                        </div>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xl">🎟️</span>
                          </div>
                        </div>
                        <div className="text-3xl font-black mb-2">
                          {analytics?.ticketsSold ||
                            event.totalTickets - event.remainingTickets}
                        </div>
                        <div className="text-purple-100 font-bold text-lg">
                          Tickets Sold
                        </div>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xl">💎</span>
                          </div>
                        </div>
                        <div className="text-3xl font-black mb-2">
                          {formatCurrency(
                            analytics?.averageTicketPrice || event.ticketPrice
                          )}
                        </div>
                        <div className="text-yellow-100 font-bold text-lg">
                          Avg. Price
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl">📈</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        Performance Summary
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mb-2">
                          {event.totalTickets - event.remainingTickets} /{" "}
                          {event.totalTickets}
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Tickets Progress
                        </div>
                      </div>
                      <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-blue-700 dark:text-blue-300 mb-2">
                          {formatCurrency(event.ticketPrice)}
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          Price per Ticket
                        </div>
                      </div>
                      <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-purple-700 dark:text-purple-300 mb-2">
                          {formatRelativeDate(event.createdAt)}
                        </div>
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          Event Created
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Data Section */}
                  {analytics?.canceledBookingsData && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-red-100 dark:border-red-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl">❌</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                          Cancellation Overview
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                          <div className="text-3xl font-black text-red-700 dark:text-red-300 mb-2">
                            {analytics.canceledBookingsData
                              .totalCanceledBookings || 0}
                          </div>
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            Canceled Bookings
                          </div>
                        </div>
                        <div className="text-center p-6 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                          <div className="text-3xl font-black text-orange-700 dark:text-orange-300 mb-2">
                            {analytics.canceledBookingsData
                              .totalTicketsToRefund || 0}
                          </div>
                          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            Tickets to Refund
                          </div>
                        </div>
                        <div className="text-center p-6 bg-pink-100 dark:bg-pink-900/30 rounded-2xl">
                          <div className="text-3xl font-black text-pink-700 dark:text-pink-300 mb-2">
                            {formatCurrency(
                              analytics.canceledBookingsData
                                .totalRefundAmount || 0
                            )}
                          </div>
                          <div className="text-sm font-bold text-pink-600 dark:text-pink-400">
                            Total Refunds
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Event Bookings
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-bold">
                        Total: {bookings.length} bookings
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">👥</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                        No bookings yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Bookings will appear here once people start registering
                        for your event.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <div
                          key={booking._id || index}
                          className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                  <span className="text-white text-xl">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-gray-900 dark:text-white">
                                    {booking.user?.name || "Unknown User"}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-300 font-bold">
                                    {booking.user?.email || "No email"}
                                  </p>
                                </div>
                                <span className="inline-flex px-4 py-2 text-sm font-black rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  {booking.status || "confirmed"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                  <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                                    {booking.ticketsBooked || 1}
                                  </div>
                                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    Tickets
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                                    {formatCurrency(booking.totalPrice || 0)}
                                  </div>
                                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    Total
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                                  <div className="text-lg font-black text-purple-700 dark:text-purple-300">
                                    {booking.bookingDate
                                      ? formatRelativeDate(booking.bookingDate)
                                      : "Recently"}
                                  </div>
                                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                    Booked
                                  </div>
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

              {activeTab === "cancellations" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Canceled Bookings
                      </h2>
                      <div className="flex space-x-6 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">
                          Total Cancellations:{" "}
                          {analytics?.canceledBookingsData
                            ?.totalCanceledBookings || 0}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-bold">
                          Tickets to Refund:{" "}
                          {analytics?.canceledBookingsData
                            ?.totalTicketsToRefund || 0}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">❌</span>
                    </div>
                  </div>

                  {/* Cancellation Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="text-3xl font-black mb-2">
                          {analytics?.canceledBookingsData
                            ?.totalCanceledBookings || 0}
                        </div>
                        <div className="text-red-100 font-bold text-lg">
                          Canceled Bookings
                        </div>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="text-3xl font-black mb-2">
                          {analytics?.canceledBookingsData
                            ?.totalTicketsToRefund || 0}
                        </div>
                        <div className="text-yellow-100 font-bold text-lg">
                          Tickets to Refund
                        </div>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="text-3xl font-black mb-2">
                          {formatCurrency(
                            analytics?.canceledBookingsData
                              ?.totalRefundAmount || 0
                          )}
                        </div>
                        <div className="text-orange-100 font-bold text-lg">
                          Refund Amount
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Canceled Bookings List */}
                  {!analytics?.canceledBookingsData?.canceledBookings
                    ?.length ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                        No Cancellations
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Great news! There are no canceled bookings for this
                        event.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        Cancellation Details
                      </h3>
                      {analytics.canceledBookingsData.canceledBookings.map(
                        (cancellation, index) => (
                          <div
                            key={cancellation.id || index}
                            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 p-8 rounded-3xl border-l-4 border-red-500"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-4">
                                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                                    <span className="text-red-500 text-xl">
                                      👤
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white">
                                      {cancellation.bookerName}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 font-bold">
                                      {cancellation.bookerEmail}
                                    </p>
                                  </div>
                                  <span className="inline-flex px-4 py-2 text-sm font-black rounded-2xl bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Canceled
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                    <div className="text-2xl font-black text-red-700 dark:text-red-300">
                                      {cancellation.ticketsToRefund}
                                    </div>
                                    <div className="text-sm font-bold text-red-600 dark:text-red-400">
                                      Tickets to Refund
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                                    <div className="text-2xl font-black text-orange-700 dark:text-orange-300">
                                      {formatCurrency(
                                        cancellation.refundAmount
                                      )}
                                    </div>
                                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                      Refund Amount
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                    <div className="text-lg font-black text-blue-700 dark:text-blue-300">
                                      {formatRelativeDate(
                                        cancellation.originalBookingDate
                                      )}
                                    </div>
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      Originally Booked
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                                    <div className="text-lg font-black text-purple-700 dark:text-purple-300">
                                      {formatRelativeDate(
                                        cancellation.canceledAt
                                      )}
                                    </div>
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                      Canceled
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Event Management
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-bold">
                        Administrative controls and information
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">⚙️</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-indigo-200/50 dark:border-indigo-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl">⚡</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                          Quick Actions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <Button
                          to={`/organizer/events/${id}/edit`}
                          variant="primary"
                          size="default"
                          className="w-full"
                          icon={
                            <svg
                              className="w-5 h-5"
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
                          }
                          iconPosition="left"
                        >
                          Edit Event Details
                        </Button>

                        <Button
                          onClick={handleCopyEventLink}
                          variant="secondary"
                          size="default"
                          className="w-full"
                          icon={
                            <svg
                              className="w-5 h-5"
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
                          }
                          iconPosition="left"
                        >
                          Copy Event Link
                        </Button>

                        <Button
                          onClick={() => setShowDeleteModal(true)}
                          variant="danger"
                          size="default"
                          className="w-full"
                          icon={
                            <svg
                              className="w-5 h-5"
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
                          }
                          iconPosition="left"
                        >
                          Delete Event
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl">ℹ️</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                          Event Information
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Event ID
                          </span>
                          <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                            {event._id}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Created
                          </span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatDate(event.createdAt)}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Last Updated
                          </span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatDate(event.updatedAt)}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Public URL
                          </span>
                          <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all">
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
        </motion.div>
      )}

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
                className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl relative z-[60] border border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-4">
                    <svg
                      className="h-6 w-6 text-red-500"
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
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    Delete Event
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    "{event.title}"
                  </span>
                  ? This action cannot be undone. All bookings and data
                  associated with this event will be permanently removed.
                </p>

                <div className="flex justify-end space-x-4">
                  <Button
                    onClick={() => setShowDeleteModal(false)}
                    variant="outline"
                    size="default"
                    className="!border-2 !border-gray-300 dark:!border-gray-600 !text-gray-700 dark:!text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                    variant="danger"
                    size="default"
                    icon={
                      isDeleting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <svg
                          className="h-5 w-5"
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
                      )
                    }
                    iconPosition="left"
                  >
                    {isDeleting ? "Deleting..." : "Delete Event"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default EventDetailsPage;
