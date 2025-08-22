import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getOrganizerEvents,
  deleteEvent,
} from "../../services/organizerService";
const EventsListPage = () => {
  const { currentUser, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "date",
    dateRange: "all", // 'all', 'upcoming', 'past'
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(token, eventId);
      setEvents(events.filter((event) => event._id !== eventId));
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete event. Please try again.");
      console.error("Delete error:", err);
    }
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
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            You must be logged in as an organizer to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-grow p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
            <Link
              to="/organizer/events/create"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create New Event
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="date-desc">Sort by Date (Descending)</option>
                  <option value="title">Sort by Title</option>
                  <option value="price">Sort by Price</option>
                  <option value="price-desc">Sort by Price (Descending)</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Events Table */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500 mb-4">No events found.</p>
                <Link
                  to="/organizer/events/create"
                  className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEvents.map((event) => (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/organizer/events/${event._id}`}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              {event.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {event.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
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
                              <span className="text-xs">
                                {event.totalTickets - event.remainingTickets}/
                                {event.totalTickets}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${event.ticketPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                to={`/organizer/events/${event._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(event._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsListPage;
