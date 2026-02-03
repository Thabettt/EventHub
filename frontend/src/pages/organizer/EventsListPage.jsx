import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import { getOrganizerEvents } from "../../services/organizerService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

const EventsListPage = () => {
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "date",
    dateRange: "all",
  });

  // Fetch events when component mounts or filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiFilters = { ...filters };
        if (filters.dateRange === "upcoming") {
          apiFilters.startDate = new Date().toISOString();
        } else if (filters.dateRange === "past") {
          apiFilters.endDate = new Date().toISOString();
        }

        const response = await getOrganizerEvents(token, apiFilters);
        setEvents(response.data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.role === "Organizer") {
      fetchEvents();
    }
  }, [token, currentUser, filters]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter events based on search term
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Mobile Events Management */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Executive Mobile Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="back" size="square" />
                <div>
                  <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                    Events Management
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                    {filteredEvents.length} events •{" "}
                    {currentUser?.name || "User"}
                  </p>
                </div>
              </div>
              <Button
                to="/organizer/events/create"
                variant="primary"
                size="small"
                className="!px-3 !py-2 !text-xs"
              >
                + Create
              </Button>
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
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="px-2 pr-6 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 6px center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "14px",
                  }}
                >
                  <option value="">Category</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Charity">Charity</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food</option>
                  <option value="Business">Business</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Education">Education</option>
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  className="px-2 pr-6 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 6px center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "14px",
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
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
                  <option value="date">By Date</option>
                  <option value="title">By Title</option>
                  <option value="price">By Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Events List */}
          <div className="px-4 pb-6">
            {isLoading ? (
              <LoadingSpinner
                variant="page"
                size="md"
                message="Loading Events"
                subMessage="Fetching your events..."
              />
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-4 rounded-xl shadow-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-bold text-sm">
                      Error Loading Events
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Start building your event portfolio
                </p>
                <Button
                  to="/organizer/events/create"
                  variant="primary"
                  size="small"
                  icon={<span>✨</span>}
                  iconPosition="left"
                >
                  Create First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <Link
                          to={`/organizer/events/${event._id}`}
                          className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                        >
                          {event.title}
                        </Link>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>📅</span>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>📍</span>
                            <span className="truncate max-w-20">
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          ${event.ticketPrice.toFixed(2)}
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tickets Sold
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {event.totalTickets - event.remainingTickets}/
                          {event.totalTickets}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (100 *
                                (event.totalTickets - event.remainingTickets)) /
                              event.totalTickets
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      to={`/organizer/events/${event._id}`}
                      variant="primary"
                      size="small"
                      className="w-full !text-sm"
                    >
                      Manage Event
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Events Management */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10 overflow-hidden">
          <div className="flex flex-col min-h-screen">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Button
                    variant="back"
                    size="default"
                    className="!bg-gray-100 dark:!bg-white/10 !text-gray-900 dark:!text-white hover:!bg-gray-200 dark:hover:!bg-white/20"
                  />
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Events Management
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      {filteredEvents.length} events in your portfolio •{" "}
                      {currentUser?.name || "User"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    to="/organizer/events/create"
                    variant="primary"
                    size="default"
                    icon={<span className="text-lg">✨</span>}
                    iconPosition="left"
                  >
                    Create Event
                  </Button>
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
                      Event Portfolio
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Manage and monitor your event portfolio
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Search Bar */}
                  <div className="lg:col-span-5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">🔍</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search events by title or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="lg:col-span-7 grid grid-cols-3 gap-3">
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="px-4 pr-10 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 12px center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="">All Categories</option>
                      <option value="Music">Music</option>
                      <option value="Technology">Technology</option>
                      <option value="Charity">Charity</option>
                      <option value="Sports">Sports</option>
                      <option value="Art">Art</option>
                      <option value="Food">Food</option>
                      <option value="Business">Business</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Education">Education</option>
                    </select>

                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        handleFilterChange("dateRange", e.target.value)
                      }
                      className="px-4 pr-10 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 12px center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="all">All Time Periods</option>
                      <option value="upcoming">Upcoming Events</option>
                      <option value="past">Past Events</option>
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
                      <option value="date">Sort by Date</option>
                      <option value="title">Sort by Title</option>
                      <option value="price">Sort by Price</option>
                      <option value="price-desc">
                        Sort by Price (High to Low)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Events Content */}
              {isLoading ? (
                <LoadingSpinner
                  variant="page"
                  size="xl"
                  message="Loading Event Portfolio"
                  subMessage="Fetching your comprehensive event data and analytics..."
                />
              ) : error ? (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-8 rounded-3xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-6">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-red-800 dark:text-red-200 font-bold text-xl mb-2">
                        Portfolio Loading Error
                      </h3>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="default">
                    Retry Loading
                  </Button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No Events in Portfolio
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Start building your event empire. Create engaging
                    experiences that bring people together.
                  </p>
                  <Button
                    to="/organizer/events/create"
                    variant="primary"
                    size="large"
                    icon={<span className="text-xl">✨</span>}
                    iconPosition="left"
                  >
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50/70 dark:bg-gray-900/70">
                        <tr>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Event Details
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Schedule
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Ticket Progress
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                        {filteredEvents.map((event) => (
                          <tr
                            key={event._id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors duration-200"
                          >
                            <td className="px-8 py-6">
                              <div>
                                <Link
                                  to={`/organizer/events/${event._id}`}
                                  className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                  {event.title}
                                </Link>
                                <div className="flex items-center space-x-1 mt-1 text-gray-600 dark:text-gray-400">
                                  <span>📍</span>
                                  <span className="text-sm font-medium">
                                    {event.location}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">📅</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-200">
                                {event.category}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {event.totalTickets -
                                      event.remainingTickets}
                                    /{event.totalTickets}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {Math.round(
                                      (100 *
                                        (event.totalTickets -
                                          event.remainingTickets)) /
                                        event.totalTickets
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${
                                        (100 *
                                          (event.totalTickets -
                                            event.remainingTickets)) /
                                        event.totalTickets
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                ${event.ticketPrice.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                per ticket
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <Button
                                to={`/organizer/events/${event._id}`}
                                variant="primary"
                                size="small"
                                className="!px-6 !py-3 whitespace-nowrap"
                              >
                                Manage Event
                              </Button>
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

export default EventsListPage;
