import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import OrganizerSidebar from "../../components/layout/OrganizerSidebar";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch event details
        const eventResponse = await fetch(
          `http://localhost:3003/api/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event details");
        }

        const eventData = await eventResponse.json();
        setEvent(eventData.data);

        // Fetch bookings for this event
        const bookingsResponse = await fetch(
          `http://localhost:3003/api/events/${eventId}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData.data || []);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && token) {
      fetchEventDetails();
    }
  }, [eventId, token]);

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Redirect to events list
      navigate("/organizer/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || "Failed to delete event");
      setShowDeleteModal(false);
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, MMMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Calculate statistics
  const ticketsSold = event ? event.totalTickets - event.remainingTickets : 0;
  const revenue = ticketsSold * (event?.ticketPrice || 0);
  const percentageSold = event
    ? Math.round((ticketsSold / event.totalTickets) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OrganizerSidebar />
        <div className="flex-grow p-6 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-xl font-medium text-gray-600">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OrganizerSidebar />
        <div className="flex-grow p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OrganizerSidebar />
        <div className="flex-grow p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Event not found. It may have been deleted or you may not have
                  permission to view it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Navigation breadcrumb */}
          <div className="flex items-center mb-6 text-sm">
            <Link
              to="/organizer/events"
              className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Events
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600 truncate max-w-md">
              {event.title}
            </span>
          </div>

          {/* Event header with hero section */}
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
            {event.image && (
              <div className="absolute inset-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-30"
                />
              </div>
            )}
            <div className="relative px-8 py-16 flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-medium rounded-full mb-4 shadow-sm">
                  {event.category}
                </span>
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                  {event.title}
                </h1>
                <div className="flex items-center text-indigo-100 mb-6">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatEventDate(event.date)}</span>
                </div>
                <div className="flex items-center text-indigo-100">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex flex-col md:items-end">
                <div className="flex space-x-3">
                  <Link
                    to={`/organizer/events/${eventId}/edit`}
                    className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-md flex items-center"
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
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Event
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-lg hover:bg-white/30 transition-colors shadow-md flex items-center"
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
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>

                <div className="flex items-center mt-6 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-white shadow-sm">
                  <span className="text-sm">
                    Created: {format(new Date(event.createdAt), "MMM d, yyyy")}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    Last Updated:{" "}
                    {format(new Date(event.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 ml-3">
                  Tickets Sold
                </h2>
              </div>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold text-gray-900">
                  {ticketsSold}
                </div>
                <div className="text-lg text-gray-500 ml-2">
                  / {event.totalTickets}
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      percentageSold < 25
                        ? "bg-yellow-400"
                        : percentageSold < 75
                        ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                        : "bg-gradient-to-r from-green-400 to-emerald-500"
                    }`}
                    style={{ width: `${percentageSold}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {percentageSold}% sold
                  </div>
                  {percentageSold === 100 ? (
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Sold Out
                    </span>
                  ) : percentageSold >= 75 ? (
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Selling Fast
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 ml-3">
                  Remaining Tickets
                </h2>
              </div>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold text-gray-900">
                  {event.remainingTickets}
                </div>
                <div className="text-lg text-gray-500 ml-2">tickets</div>
              </div>
              <div className="mt-4">
                {event.remainingTickets === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-600 font-medium">Sold Out</span>
                  </div>
                ) : event.remainingTickets < event.totalTickets * 0.2 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-yellow-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-yellow-600 font-medium">
                      Almost Sold Out
                    </span>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-600 font-medium">
                      Available for purchase
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 ml-3">
                  Total Sales
                </h2>
              </div>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold text-emerald-600">
                  ${revenue.toLocaleString()}
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ticket Price:</span>
                    <span className="font-medium text-gray-900">
                      ${event.ticketPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Tickets Sold:</span>
                    <span className="font-medium text-gray-900">
                      x {ticketsSold}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total:</span>
                    <span className="font-bold text-emerald-600">
                      ${revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event details sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Event info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Description
                  </h2>
                </div>
                <div className="prose max-w-none text-gray-600">
                  <p className="leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Attendees List */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-violet-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 ml-3">
                      Attendees
                    </h2>
                  </div>
                  <div className="bg-violet-100 text-violet-800 font-medium px-3 py-1 rounded-full text-sm">
                    Total: {bookings.length}
                  </div>
                </div>

                {bookings.length > 0 ? (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 shadow-sm">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Booking Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tickets
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.map((booking, index) => (
                            <tr
                              key={booking._id || index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-sm font-bold">
                                    {booking.user?.name
                                      ? booking.user.name
                                          .charAt(0)
                                          .toUpperCase()
                                      : "?"}
                                  </div>
                                  <div className="ml-3 font-medium text-gray-900">
                                    {booking.user?.name || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-500">
                                  {booking.user?.email || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-500">
                                  {booking.createdAt
                                    ? format(
                                        new Date(booking.createdAt),
                                        "MMM d, yyyy"
                                      )
                                    : "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                                  {booking.ticketsBooked || 1}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-gray-200">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">
                      No bookings for this event yet.
                    </p>
                    <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Share Your Event
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Additional info */}
            <div className="space-y-8">
              {/* Event Image */}
              {event.image && (
                <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 ml-3">
                      Event Image
                    </h2>
                  </div>
                  <div className="relative rounded-lg overflow-hidden group">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x200?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                        Event Cover Image
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Event Details
                  </h2>
                </div>
                <dl className="space-y-4">
                  <div className="flex items-center py-3 border-b border-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase">
                        Date & Time
                      </dt>
                      <dd className="mt-1 text-gray-800">
                        {formatEventDate(event.date)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center py-3 border-b border-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase">
                        Location
                      </dt>
                      <dd className="mt-1 text-gray-800">{event.location}</dd>
                    </div>
                  </div>

                  <div className="flex items-center py-3 border-b border-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase">
                        Category
                      </dt>
                      <dd className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {event.category}
                        </span>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center py-3 border-b border-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase">
                        Ticket Price
                      </dt>
                      <dd className="mt-1 text-gray-800">
                        ${event.ticketPrice.toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white ml-3">
                    Quick Actions
                  </h2>
                </div>
                <div className="space-y-3">
                  <a
                    href={`/events/${eventId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Public Page
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <Link
                    to="/organizer/events/create"
                    state={{ cloneFrom: event }}
                    className="w-full flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Duplicate Event
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                  <button className="w-full flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white transition-colors">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share Event
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-fadeIn">
            <div className="bg-red-50 rounded-t-xl px-6 py-4 flex items-center">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-700">
                Confirm Deletion
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{event.title}</span>? This
                action cannot be undone and will remove all associated data.
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center"
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
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
