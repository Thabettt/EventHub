import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  createBooking,
  createCheckoutSession,
} from "../../services/bookingService";

// Components
import Footer from "../../components/layout/Footer";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import Button from "../../components/common/Button";

// Context
import { AuthContext } from "../../context/AuthContext";
import useDeviceDetection from "../../hooks/useDeviceDetection";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser: user } = useContext(AuthContext);
  const deviceInfo = useDeviceDetection();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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

  // Calculate time remaining until event
  const calculateTimeRemaining = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const timeRemaining = eventTime - now;

    if (timeRemaining <= 0) {
      return { expired: true };
    }

    if (isNaN(eventTime.getTime())) {
      return { days: 0, hours: 0, minutes: 0, expired: true };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    return {
      days: isNaN(days) ? 0 : days,
      hours: isNaN(hours) ? 0 : hours,
      minutes: isNaN(minutes) ? 0 : minutes,
      expired: false,
    };
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching event with ID: ${id}`);
        const response = await axios.get(`/api/events/${id}`);
        console.log("Event data received:", response.data);

        const eventData = response.data.data || response.data;
        setEvent(eventData);

        const similarResponse = await axios.get(`/api/events/similar/${id}`);
        const similarData = similarResponse.data.data || similarResponse.data;
        setSimilarEvents(similarData.slice(0, 3));

        setLoading(false);
      } catch (err) {
        console.error("Error details:", err);
        setError("Failed to load event details. Please try again later.");
        setLoading(false);
      }
    };

    fetchEventDetails();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.min(
      Math.max(1, ticketQuantity + value),
      event?.remainingTickets || 1,
    );
    setTicketQuantity(newQuantity);
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setBookingInProgress(true);
      const token = localStorage.getItem("token");

      // Paid events → redirect to Stripe Checkout
      if (event.ticketPrice > 0) {
        const response = await createCheckoutSession(
          token,
          event._id,
          ticketQuantity,
        );
        // Redirect to Stripe-hosted checkout page
        window.location.href = response.data.url;
        return;
      }

      // Free events → instant booking (existing behavior)
      const bookingData = {
        ticketsBooked: ticketQuantity,
        totalPrice: 0,
      };

      await createBooking(token, event._id, bookingData);

      toast.success("Booking successful! Check your profile for details.");
      setIsBookingModalOpen(false);

      // Refresh event data
      const refreshResponse = await axios.get(`/api/events/${id}`);
      const updatedEventHelper =
        refreshResponse.data.data || refreshResponse.data;
      setEvent(updatedEventHelper);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Failed to book tickets");
    } finally {
      setBookingInProgress(false);
    }
  };

  // Check if event is sold out
  const isSoldOut = event?.remainingTickets === 0;

  // Check if event date has passed
  const isEventPassed = event ? new Date(event.date) < new Date() : false;

  // Calculate percentage of tickets sold
  const percentageSold =
    event && event.totalTickets > 0
      ? Math.round(
          ((event.totalTickets - event.remainingTickets) / event.totalTickets) *
            100,
        )
      : 0;

  // Time remaining until event
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
              <Button variant="danger" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="back">Back to Events</Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex items-center justify-center h-[70vh]">
          <LoadingSpinner size="lg" message="Event not found..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {deviceInfo.isMobile || deviceInfo.isTablet ? (
        // Mobile/Tablet View
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
          {/* Parallax Hero Image - Fixed Background */}
          <div className="fixed inset-0 top-0 left-0 right-0 h-[60vh] z-0">
            <img
              src={
                event.image || "https://placehold.co/800x600?text=Event+Image"
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          </div>

          {/* Main Content Scroll Container - The Sheet */}
          <div className="relative z-10 pt-[50vh] pb-0">
            <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] min-h-[60vh] pb-8">
              {/* Pull indicator */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50" />
              </div>

              <div className="px-8 pb-12 pt-4">
                {/* Category Pill */}
                <span className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-md shadow-indigo-500/30">
                  {event.category}
                </span>

                {/* Massive Title */}
                <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-[1.1] mb-4 tracking-tight">
                  {event.title}
                </h1>

                {/* Quick Info Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    <span className="mr-2 text-lg">🗓️</span>
                    {activeTab === "details"
                      ? formatDate(event.date)
                      : event.location}
                  </div>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    <span className="mr-2 text-lg">📍</span>
                    {event.city || "City"}
                  </div>
                </div>

                {/* Inline Booking Card - Redesigned */}
                {/* Inline Booking Card - Refined & Harmonious */}
                <div className="mb-8 p-1 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 shadow-lg shadow-indigo-500/5 relative overflow-hidden ring-1 ring-white/20 dark:ring-white/10">
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-[1.9rem]" />

                  <div className="relative px-6 py-5 flex items-center justify-between">
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1">
                        Price Per Person
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                          ${event.ticketPrice?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>

                    {!isSoldOut && !isEventPassed ? (
                      <Button
                        variant="primary"
                        onClick={() => setIsBookingModalOpen(true)}
                        icon={<></>}
                        className="!rounded-xl !px-6 !py-3 !bg-[#6600FF] hover:!bg-[#5500DD] !text-white !font-bold !text-sm !shadow-md shadow-indigo-500/30 whitespace-nowrap min-w-[130px] flex justify-center items-center h-12"
                      >
                        GET TICKETS
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="!rounded-xl !px-6 !py-3 opacity-60 cursor-not-allowed font-bold text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 whitespace-nowrap h-12"
                      >
                        {isSoldOut ? "SOLD OUT" : "ENDED"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Tabs - Modern Pill Style */}
                <div className="flex space-x-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {["details", "location", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300 transform active:scale-95 whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === "details" && (
                        <div className="space-y-6">
                          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-serif">
                            {event.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                              <div className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase mb-1">
                                Total Tickets
                              </div>
                              <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {event.totalTickets}
                              </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800/30">
                              <div className="text-green-500 dark:text-green-400 text-xs font-bold uppercase mb-1">
                                Available
                              </div>
                              <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {event.remainingTickets}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "location" && (
                        <div className="space-y-6">
                          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4241,37.78,14.25,0,60/600x600?access_token=Pk.eyJ1IjoiYmFyIn0.1')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
                            <div className="relative bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-lg flex items-center font-bold text-gray-900 dark:text-white transform group-hover:scale-105 transition-transform">
                              <span className="mr-2 text-red-500 text-xl">
                                📍
                              </span>{" "}
                              Open Map
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                              Address
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {event.location}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              {event.city || ""}, {event.state || ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "reviews" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-6 rounded-2xl shadow-xl">
                            <div>
                              <div className="text-4xl font-black">4.8</div>
                              <div className="text-sm opacity-80 font-medium">
                                Average Rating
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex text-yellow-400 text-lg mb-1">
                                ★★★★★
                              </div>
                              <div className="text-xs font-bold uppercase tracking-wider opacity-70">
                                24 Reviews
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
                              >
                                <div className="flex items-center mb-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                                  <div className="ml-3">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                                      Happy User
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Verified Attendee
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                  "Absolutely mind-blowing experience. The
                                  atmosphere was electric!"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Desktop View
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
                    event.image || "https://placehold.co/1200x800?text=No+Image"
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
                  event.image || "https://placehold.co/600x400?text=No+Image"
                }
                alt={event.title}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-md"
                style={{ maxHeight: "80%" }}
              />
            </div>

            {isSoldOut && (
              <div className="absolute top-4 right-4">
                <div className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-xl transform -rotate-6 scale-110 border-2 border-white">
                  SOLD OUT
                </div>
              </div>
            )}

            {isEventPassed && (
              <div className="absolute top-4 right-4">
                <div className="bg-gray-800 text-white font-bold px-6 py-3 rounded-lg shadow-xl transform -rotate-6 scale-110 border-2 border-white">
                  EVENT ENDED
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
              <div className="p-6 sm:p-10">
                {/* Header section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 text-indigo-800 text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                      {!timeRemaining.expired && !isEventPassed && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800 text-sm font-medium rounded-full flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {event.title}
                    </h1>

                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
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

                      <div className="hidden sm:flex items-center">
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
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      ${event.ticketPrice?.toFixed(2) || "0.00"}
                      <span className="text-gray-500 dark:text-gray-300 text-sm font-normal">
                        /ticket
                      </span>
                    </div>

                    {!isSoldOut && !isEventPassed && !timeRemaining.expired && (
                      <Button
                        variant="primary"
                        onClick={() => setIsBookingModalOpen(true)}
                        icon={
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                        }
                        iconPosition="left"
                      >
                        Book Tickets
                      </Button>
                    )}

                    {(isSoldOut || isEventPassed || timeRemaining.expired) && (
                      <Button variant="secondary" disabled>
                        {isSoldOut
                          ? "Sold Out"
                          : isEventPassed
                            ? "Event Ended"
                            : "Booking Closed"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Countdown timer */}
                {!timeRemaining.expired && !isEventPassed && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg transition-colors">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      Event Starts In
                    </h3>
                    <div className="flex justify-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white dark:bg-gray-900 w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                          {timeRemaining.days}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Days
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white dark:bg-gray-900 w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                          {timeRemaining.hours}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Hours
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white dark:bg-gray-900 w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                          {timeRemaining.minutes}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Minutes
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ticket availability */}
                {!isEventPassed && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        Ticket Availability
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {event.remainingTickets} of {event.totalTickets} tickets
                        left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentageSold < 50
                            ? "bg-green-500"
                            : percentageSold < 80
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${percentageSold}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Tabs navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-8 transition-colors">
                  <div className="flex space-x-8">
                    <Button
                      variant={
                        activeTab === "details" ? "primary" : "secondary"
                      }
                      onClick={() => setActiveTab("details")}
                      className={`!py-4 !px-1 !border-b-2 !font-medium !text-sm !transition-colors !duration-200 ${
                        activeTab === "details"
                          ? "!border-indigo-500 !text-indigo-600 dark:!text-indigo-400"
                          : "!border-transparent !text-gray-500 dark:!text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200 hover:!border-gray-300 dark:hover:!border-gray-600"
                      } !rounded-none !bg-transparent hover:!bg-transparent`}
                    >
                      Event Details
                    </Button>
                    <Button
                      variant={
                        activeTab === "location" ? "primary" : "secondary"
                      }
                      onClick={() => setActiveTab("location")}
                      className={`!py-4 !px-1 !border-b-2 !font-medium !text-sm !transition-colors !duration-200 ${
                        activeTab === "location"
                          ? "!border-indigo-500 !text-indigo-600 dark:!text-indigo-400"
                          : "!border-transparent !text-gray-500 dark:!text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200 hover:!border-gray-300 dark:hover:!border-gray-600"
                      } !rounded-none !bg-transparent hover:!bg-transparent`}
                    >
                      Location
                    </Button>
                    <Button
                      variant={
                        activeTab === "reviews" ? "primary" : "secondary"
                      }
                      onClick={() => setActiveTab("reviews")}
                      className={`!py-4 !px-1 !border-b-2 !font-medium !text-sm !transition-colors !duration-200 ${
                        activeTab === "reviews"
                          ? "!border-indigo-500 !text-indigo-600 dark:!text-indigo-400"
                          : "!border-transparent !text-gray-500 dark:!text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200 hover:!border-gray-300 dark:hover:!border-gray-600"
                      } !rounded-none !bg-transparent hover:!bg-transparent`}
                    >
                      Reviews
                    </Button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="mb-8">
                  {activeTab === "details" && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        About This Event
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-gray-600 dark:text-gray-300">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "location" && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Event Location
                      </h2>
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md mb-4 transition-colors">
                        <div className="bg-gray-300 dark:bg-gray-800 h-72 w-full flex items-center justify-center">
                          <div className="text-gray-500 dark:text-gray-300">
                            Map View (Integration required)
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-colors">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                          Address
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {event.location}
                        </p>

                        <h3 className="font-medium text-gray-800 dark:text-gray-100 mt-4 mb-2">
                          Getting There
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <svg
                              className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a2 2 0 012 2v2h-1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-1a4 4 0 00-4-4h-2V6a1 1 0 00-1-1H3z" />
                            </svg>
                            <div className="text-gray-600 dark:text-gray-300">
                              <span className="font-medium">By Car:</span>{" "}
                              Parking available on site. Use entrance from Main
                              Street.
                            </div>
                          </div>
                          <div className="flex items-start">
                            <svg
                              className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 7h-6v6h4l2 2z" />
                              <path
                                fillRule="evenodd"
                                d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="text-gray-600 dark:text-gray-300">
                              <span className="font-medium">
                                Public Transport:
                              </span>{" "}
                              Take bus routes 42 or 53 to Downtown Station, then
                              walk 5 minutes.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                          Reviews & Ratings
                        </h2>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-lg font-medium text-gray-800 dark:text-gray-100 ml-1">
                              4.8
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-300 ml-1">
                              (24 reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sample reviews */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="font-medium text-indigo-800">
                                  JD
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  John Doe
                                </p>
                                <div className="flex items-center mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < 5
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              3 days ago
                            </p>
                          </div>
                          <p className="mt-3 text-gray-600 dark:text-gray-300">
                            Amazing event! Well organized and the performances
                            were incredible. Would definitely attend again next
                            year.
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="font-medium text-indigo-800">
                                  AS
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Alex Smith
                                </p>
                                <div className="flex items-center mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < 4
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              1 week ago
                            </p>
                          </div>
                          <p className="mt-3 text-gray-600 dark:text-gray-300">
                            Great event overall but the parking situation could
                            be better. The performances were top-notch though!
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          className="!text-indigo-600 dark:!text-indigo-400 hover:!text-indigo-800 dark:hover:!text-indigo-300 !font-medium !text-sm"
                        >
                          View All Reviews
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Footer />

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsBookingModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-100 dark:border-gray-700">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                        Checkout
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Price
                        </div>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          ${event.ticketPrice?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Total
                        </div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">
                          $
                          {((event.ticketPrice || 0) * ticketQuantity).toFixed(
                            2,
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Number of Tickets
                      </label>
                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 rounded-xl p-2">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={ticketQuantity <= 1}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                          <svg
                            className="w-4 h-4 text-gray-700 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-2xl font-black text-gray-900 dark:text-white w-12 text-center">
                          {ticketQuantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={ticketQuantity >= event.remainingTickets}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                          <svg
                            className="w-4 h-4 text-gray-700 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {event.remainingTickets} tickets remaining
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleBookingSubmit}
                      isLoading={bookingInProgress}
                      className="w-full !py-4 !text-lg !rounded-xl !shadow-lg shadow-indigo-500/20"
                    >
                      {event.ticketPrice > 0
                        ? "Confirm & Pay"
                        : "Confirm Booking"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetailPage;
