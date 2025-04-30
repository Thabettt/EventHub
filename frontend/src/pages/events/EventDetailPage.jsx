import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.baseURL = `http://localhost:3003`;
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Components
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

// Context
import { AuthContext } from "../../context/AuthContext";

// Add this right after your imports
const MOCK_EVENT = {
  _id: "mock123",
  title: "Sample Conference",
  description:
    "This is a sample event for development purposes with detailed information about the speakers, schedule, and topics that will be covered.",
  date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
  location: "Downtown Convention Center, 123 Main St",
  category: "Conference",
  image:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
  ticketPrice: 49.99,
  totalTickets: 100,
  remainingTickets: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_SIMILAR_EVENTS = [
  {
    _id: "mock456",
    title: "Tech Meetup 2023",
    description: "Monthly technology meetup",
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    location: "Tech Hub, 45 Innovation Ave",
    category: "Meetup",
    image:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop",
    ticketPrice: 0,
    totalTickets: 50,
    remainingTickets: 20,
  },
  {
    _id: "mock789",
    title: "Design Workshop",
    description: "Learn UI/UX design principles",
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: "Creative Studio, 78 Design Blvd",
    category: "Workshop",
    image:
      "https://images.unsplash.com/photo-1544928147-79a2dbc1f669?w=800&auto=format&fit=crop",
    ticketPrice: 29.99,
    totalTickets: 30,
    remainingTickets: 8,
  },
];

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

  useEffect(() => {
    const fetchEventDetails = async () => {
      // Modify your API fetch to handle the API response format:
      // Replace your try/catch block with this:
      try {
        setLoading(true);
        console.log(`Fetching event with ID: ${id}`);
        const response = await axios.get(`/api/events/${id}`);
        console.log("Event data received:", response.data);

        // Check if the response has a data property (common API pattern)
        const eventData = response.data.data || response.data;
        setEvent(eventData);

        // Similar approach for similar events
        const similarResponse = await axios.get(`/api/events/similar/${id}`);
        const similarData = similarResponse.data.data || similarResponse.data;
        setSimilarEvents(similarData.slice(0, 3));

        setLoading(false);
      } catch (err) {
        console.error("Error details:", err);

        // For development - use mock data to continue working
        if (process.env.NODE_ENV !== "production") {
          console.log("Using mock data for development");
          setEvent(MOCK_EVENT);
          setSimilarEvents(MOCK_SIMILAR_EVENTS);
          setLoading(false);
          return;
        }

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
      event?.remainingTickets || 1
    );
    setTicketQuantity(newQuantity);
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingInProgress(true);

      // Get the actual token from localStorage - don't use a mock token
      const token = localStorage.getItem("token");

      // Prepare the booking data
      const bookingData = {
        ticketsBooked: ticketQuantity,
        totalPrice: ticketQuantity * event.ticketPrice,
      };

      // Make the API request with the real auth token
      const response = await axios.post(
        `/api/bookings/events/${event._id}`,
        bookingData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      toast.success("Booking successful! Check your profile for details.");
      setIsBookingModalOpen(false);

      // Refresh event data to update ticket availability - FIX HERE
      try {
        const updatedEventResponse = await axios.get(`/api/events/${id}`);
        // Handle the API response format consistently
        const updatedEventData =
          updatedEventResponse.data.data || updatedEventResponse.data;
        setEvent(updatedEventData);
      } catch (refreshError) {
        console.error("Error refreshing event data:", refreshError);
        // Don't cause white screen if refresh fails - use existing data
      }
    } catch (err) {
      console.error("Booking error:", err);

      // Handle unauthorized errors without redirecting
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Authentication error. Please log in before booking.");
      } else {
        toast.error(
          err.response?.data?.message ||
            "Failed to book tickets. Please try again."
        );
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  // Check if event is sold out
  const isSoldOut = event?.remainingTickets === 0;

  // Check if event date has passed
  const isEventPassed = event ? new Date(event.date) < new Date() : false;

  // Calculate percentage of tickets sold
  const percentageSold = event
    ? Math.round(
        ((event.totalTickets - event.remainingTickets) / event.totalTickets) *
          100
      )
    : 0;

  // Time remaining until event
  const timeRemaining = event
    ? calculateTimeRemaining(event.date)
    : { expired: true };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <LoadingSpinner size="lg" message="Loading event details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            className="bg-white p-8 rounded-xl shadow-md"
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Error Loading Event
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link
                to="/events"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-10">
                {/* Header section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                      {!timeRemaining.expired && !isEventPassed && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center">
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

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h1>

                    <div className="flex items-center space-x-3 text-gray-600">
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

                  <div className="mt-6 md:mt-0 flex flex-col items-end">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      ${event.ticketPrice.toFixed(2)}
                      <span className="text-gray-500 text-sm font-normal">
                        /ticket
                      </span>
                    </div>

                    {!isSoldOut && !isEventPassed && !timeRemaining.expired && (
                      <motion.button
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 flex items-center"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsBookingModalOpen(true)}
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Book Tickets
                      </motion.button>
                    )}

                    {(isSoldOut || isEventPassed || timeRemaining.expired) && (
                      <button
                        className="px-8 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                        disabled
                      >
                        {isSoldOut
                          ? "Sold Out"
                          : isEventPassed
                          ? "Event Ended"
                          : "Booking Closed"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Countdown timer */}
                {!timeRemaining.expired && !isEventPassed && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      Event Starts In
                    </h3>
                    <div className="flex justify-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                          {timeRemaining.days}
                        </div>
                        <span className="text-sm text-gray-600 mt-1">Days</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                          {timeRemaining.hours}
                        </div>
                        <span className="text-sm text-gray-600 mt-1">
                          Hours
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-white w-16 h-16 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                          {timeRemaining.minutes}
                        </div>
                        <span className="text-sm text-gray-600 mt-1">
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
                      <h3 className="text-lg font-medium text-gray-800">
                        Ticket Availability
                      </h3>
                      <span className="text-sm text-gray-600">
                        {event.remainingTickets} of {event.totalTickets} tickets
                        left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                <div className="border-b border-gray-200 mb-8">
                  <div className="flex space-x-8">
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "details"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Event Details
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "location"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setActiveTab("location")}
                    >
                      Location
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "reviews"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Reviews
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="mb-8">
                  {activeTab === "details" && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        About This Event
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-gray-600">{event.description}</p>

                        {/* Event highlights */}
                        <div className="mt-8">
                          <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Event Highlights
                          </h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* These would typically come from the API, but for now we'll use placeholders */}
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-600">
                                Premium seating with excellent views
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-600">
                                Complimentary refreshments
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-600">
                                Networking opportunities with industry
                                professionals
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-600">
                                Exclusive event merchandise
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "location" && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Event Location
                      </h2>
                      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md mb-4">
                        {/* This would be a real map, but we'll use a placeholder image */}
                        <div className="bg-gray-300 h-72 w-full flex items-center justify-center">
                          <div className="text-gray-500">
                            Map View (Integration required)
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Address
                        </h3>
                        <p className="text-gray-600">{event.location}</p>

                        <h3 className="font-medium text-gray-800 mt-4 mb-2">
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
                            <div className="text-gray-600">
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
                            <div className="text-gray-600">
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
                        <h2 className="text-xl font-semibold text-gray-800">
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
                            <span className="text-lg font-medium text-gray-800 ml-1">
                              4.8
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              (24 reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sample reviews - would typically come from API */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="font-medium text-indigo-800">
                                  JD
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
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
                            <p className="text-sm text-gray-500">3 days ago</p>
                          </div>
                          <p className="mt-3 text-gray-600">
                            Amazing event! Well organized and the performances
                            were incredible. Would definitely attend again next
                            year.
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="font-medium text-indigo-800">
                                  AS
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
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
                            <p className="text-sm text-gray-500">1 week ago</p>
                          </div>
                          <p className="mt-3 text-gray-600">
                            Great event overall but the parking situation could
                            be better. The performances were top-notch though!
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                          View All Reviews
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar events section */}
          {similarEvents.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Similar Events You Might Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Link to={`/events/${event._id}`}>
                      <div className="relative">
                        <img
                          src={
                            event.image ||
                            "https://via.placeholder.com/300x200?text=No+Image"
                          }
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-0 right-0 m-2">
                          <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 flex items-center">
                          <svg
                            className="h-4 w-4 mr-1 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="line-clamp-1">{event.location}</span>
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-indigo-600 font-bold">
                            ${event.ticketPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking modal */}
          <AnimatePresence>
            {isBookingModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                  <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsBookingModalOpen(false)}
                  />

                  <motion.div
                    className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white rounded-lg shadow-xl relative z-[60]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Book Tickets
                      </h3>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setIsBookingModalOpen(false)}
                      >
                        <svg
                          className="h-6 w-6"
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
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(event.date)}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Number of Tickets
                      </label>
                      <div className="flex items-center">
                        <button
                          className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={ticketQuantity <= 1}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <div className="h-10 w-16 border-t border-b border-gray-300 flex items-center justify-center text-lg font-medium">
                          {ticketQuantity}
                        </div>
                        <button
                          className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          onClick={() => handleQuantityChange(1)}
                          disabled={ticketQuantity >= event.remainingTickets}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        <div className="text-sm text-gray-500 ml-4">
                          Max: {event.remainingTickets} tickets
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per ticket:</span>
                        <span className="text-gray-800">
                          ${event.ticketPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="text-gray-800">{ticketQuantity}</span>
                      </div>
                      <div className="border-t border-gray-200 my-2 pt-2">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-gray-800">Total:</span>
                          <span className="text-indigo-700">
                            ${(ticketQuantity * event.ticketPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsBookingModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 flex items-center ${
                          bookingInProgress
                            ? "opacity-75 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={handleBookingSubmit}
                        disabled={bookingInProgress}
                      >
                        {bookingInProgress ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Confirm Booking"
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

export default EventDetailPage;
