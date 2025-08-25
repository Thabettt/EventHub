import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import { getOrganizerAttendees } from "../../services/bookingService";

const AttendeesPage = () => {
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    eventName: "",
    sortBy: "name",
  });

  // Fetch attendees when component mounts or filters change
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getOrganizerAttendees(token);
        const raw = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.attendees)
          ? response.attendees
          : [];

        // If the backend returned bookings (each with a user and event),
        // normalize to one attendee per user (pick latest booking per user)
        const bookings = raw;
        const usersById = new Map();

        const getBookingDate = (b) =>
          new Date(
            b?.createdAt || b?.bookingDate || b?.registrationDate || Date.now()
          ).getTime();

        for (const b of bookings) {
          const user = b?.user || b?.attendee || b?.userId || b?.buyer;
          const userId = user?._id || user?.id || b?.userId || b?.attendeeId;
          if (!userId) continue;

          const existing = usersById.get(userId);
          const bTime = getBookingDate(b);

          if (!existing || bTime > existing._latestBookingTime) {
            usersById.set(userId, {
              _id: userId,
              name:
                user?.name ||
                user?.fullName ||
                user?.username ||
                "Unnamed Attendee",
              email: user?.email || "",
              phone: user?.phone || user?.mobile || "",
              eventName: b?.event?.title || b?.eventName || b?.eventTitle || "",
              bookingDate:
                b?.createdAt || b?.bookingDate || b?.registrationDate || null,
              _latestBookingTime: bTime,
            });
          }
        }

        const attendeesList = Array.from(usersById.values()).map((u) => {
          // remove internal helper field before saving to state
          const { _latestBookingTime, ...rest } = u;
          return rest;
        });

        setAttendees(attendeesList || []);
      } catch (err) {
        console.error("Error fetching attendees:", err);
        setError("Failed to load attendees. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.role === "Organizer") {
      fetchAttendees();
    }
  }, [token, currentUser]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter attendees based on search term
  const filteredAttendees = attendees.filter((attendee) => {
    const name = attendee.name || attendee.fullName || "";
    const email = attendee.email || "";
    const eventName = attendee.eventName || attendee.event?.title || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get unique event names for filter dropdown
  const uniqueEvents = [
    ...new Set(
      attendees.map((a) => a.eventName || a.event?.title).filter(Boolean)
    ),
  ];

  if (!currentUser || currentUser.role !== "Organizer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 flex items-center justify-center">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 p-8 rounded-3xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-yellow-800 dark:text-yellow-200 font-bold text-lg mb-2">
            Access Restricted
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            You must be logged in as an organizer to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative">
      {/* Mobile Attendees Management */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Executive Mobile Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Attendees Management
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  {filteredAttendees.length} attendees •{" "}
                  {currentUser?.name || "User"}
                </p>
              </div>
              <Link
                to="/organizer/events"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Events
              </Link>
            </div>
          </div>

          {/* Mobile Search & Filters */}
          <div className="px-4 pt-4 mb-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.eventName}
                  onChange={(e) =>
                    handleFilterChange("eventName", e.target.value)
                  }
                  className="px-2 pr-6 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 6px center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "14px",
                  }}
                >
                  <option value="">All Events</option>
                  {uniqueEvents.map((eventName) => (
                    <option key={eventName} value={eventName}>
                      {eventName}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="px-2 pr-6 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 6px center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "14px",
                  }}
                >
                  <option value="name">By Name</option>
                  <option value="email">By Email</option>
                  <option value="event">By Event</option>
                  <option value="date">By Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Attendees List */}
          <div className="px-4 pb-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="relative mb-6">
                  <div className="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-3 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Loading Attendees
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
                  Fetching your attendee data...
                </p>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-4 rounded-xl shadow-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-bold text-sm">
                      Error Loading Attendees
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No Attendees Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Start promoting your events to gather attendees
                </p>
                <Link
                  to="/organizer/events"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-300 active:scale-95 text-sm"
                >
                  <span>🎯</span>
                  <span>View My Events</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee._id || attendee.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {attendee.name ||
                            attendee.fullName ||
                            "Unnamed Attendee"}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-gray-400 text-xs">📧</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {attendee.email || "No email provided"}
                          </span>
                        </div>
                        {(attendee.eventName || attendee.event?.title) && (
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-gray-400 text-xs">🎫</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {attendee.eventName || attendee.event?.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {attendee.bookingDate && (
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {formatDate(attendee.bookingDate)}
                          </div>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                          Confirmed
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                      <Link
                        to={`/organizer/attendees/${
                          attendee._id || attendee.id
                        }`}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm active:scale-95"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Attendees Management */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10 overflow-hidden">
          <div className="flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Attendees Management
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      {filteredAttendees.length} attendees across your events •{" "}
                      {currentUser?.name || "User"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/organizer/events"
                    className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <span className="text-lg">🎯</span>
                      <span>My Events</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Search and Filters Section */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                      Attendee Database
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Manage and track your event attendees
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">👥</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Search Bar */}
                  <div className="lg:col-span-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">🔍</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search attendees by name, email, or event..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                    <select
                      value={filters.eventName}
                      onChange={(e) =>
                        handleFilterChange("eventName", e.target.value)
                      }
                      className="px-4 pr-10 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 12px center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="">All Events</option>
                      {uniqueEvents.map((eventName) => (
                        <option key={eventName} value={eventName}>
                          {eventName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="px-4 pr-10 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 12px center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="email">Sort by Email</option>
                      <option value="event">Sort by Event</option>
                      <option value="date">Sort by Registration Date</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attendees Content */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Loading Attendee Database
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Fetching comprehensive attendee data and analytics...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-8 rounded-3xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-6">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-red-800 dark:text-red-200 font-bold text-xl mb-2">
                        Database Loading Error
                      </h3>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold transition-colors"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No Attendees Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Start promoting your events to build an engaged community of
                    attendees.
                  </p>
                  <Link
                    to="/organizer/events"
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 active:scale-95"
                  >
                    <span className="text-xl">🎯</span>
                    <span>View My Events</span>
                  </Link>
                </div>
              ) : (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50/70 dark:bg-gray-900/70">
                        <tr>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Attendee Name
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Registration Date
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                        {filteredAttendees.map((attendee) => (
                          <tr
                            key={attendee._id || attendee.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors duration-200"
                          >
                            {/* Attendee Details (Name) */}
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {attendee.name ||
                                    attendee.fullName ||
                                    "Unnamed Attendee"}
                                </span>
                              </div>
                            </td>

                            {/* Contact Info (Email / Phone) */}
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">📧</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {attendee.email || "No email provided"}
                                </span>
                              </div>
                              {attendee.phone && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-lg">📱</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {attendee.phone}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Event */}
                            <td className="px-8 py-6">
                              {attendee.eventName || attendee.event?.title ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-200">
                                  {attendee.eventName || attendee.event?.title}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  No event assigned
                                </span>
                              )}
                            </td>

                            {/* Registration Date */}
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">📅</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatDate(
                                    attendee.bookingDate ||
                                      attendee.registrationDate
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-8 py-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-200">
                                ✓ Confirmed
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/organizer/attendees/${
                                    attendee._id || attendee.id
                                  }`}
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                  View Details
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeesPage;
