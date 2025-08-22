import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [soldTickets, setSoldTickets] = useState(0);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    image: "",
    ticketPrice: 0,
    totalTickets: 0,
    remainingTickets: 0,
  });

  // Category options for the dropdown
  const categoryOptions = [
    "Music",
    "Sports",
    "Arts",
    "Business",
    "Conference",
    "Workshop",
    "Community",
    "Festival",
    "Food & Drink",
    "Networking",
    "Other",
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError("");

        console.log("Fetching event with ID:", eventId);

        const response = await fetch(
          `http://localhost:3003/api/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", response.status, errorText);
          throw new Error(
            `Error ${response.status}: ${
              errorText || "Failed to fetch event details"
            }`
          );
        }

        const responseData = await response.json();
        console.log("Event API response:", responseData);

        if (!responseData?.data) {
          throw new Error("Event data missing in API response");
        }

        const eventData = responseData.data;

        // Format date for input field (YYYY-MM-DDThh:mm)
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toISOString().substring(0, 16);

        // Calculate sold tickets and revenue - with safety checks
        const totalTickets = Number(eventData.totalTickets) || 0;
        const remainingTickets = Number(eventData.remainingTickets) || 0;
        const sold = Math.max(0, totalTickets - remainingTickets);
        const revenue = sold * (Number(eventData.ticketPrice) || 0);

        console.log("Calculated values:", {
          totalTickets,
          remainingTickets,
          sold,
          revenue,
        });

        setSoldTickets(sold);
        setOriginalData(eventData);

        setFormData({
          ...eventData,
          date: formattedDate,
        });

        // Show stats message
        setSuccess(
          `Event loaded: ${sold} tickets sold, $${revenue.toFixed(
            2
          )} revenue, ${remainingTickets} tickets remaining`
        );
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err.message || "Failed to load event details. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && token) {
      fetchEvent();
    }
  }, [eventId, token]);

  // ...existing code...
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalTickets") {
      // Parse the new total capacity value
      const newTotal = Math.max(0, parseInt(value, 10) || 0);

      // Get the current sold tickets - ensure it's a valid number
      const ticketsSold = Math.max(0, soldTickets || 0);

      // Check if trying to reduce below sold amount
      if (newTotal < ticketsSold) {
        setError(
          `Cannot reduce capacity below ${ticketsSold} tickets (already sold)`
        );
        return;
      }

      // Clear any previous error
      setError("");

      // Simple calculation: remaining = total - sold
      const newRemaining = newTotal - ticketsSold;

      // Update form data with new values
      setFormData({
        ...formData,
        totalTickets: newTotal,
        remainingTickets: newRemaining, // This preserves the sold tickets
      });

      // Show clear feedback with all relevant numbers
      setSuccess(
        `Updated capacity: ${newTotal} total tickets (${ticketsSold} sold, ${newRemaining} available)`
      );
    } else if (name === "ticketPrice") {
      const newPrice = Math.max(0, parseFloat(value) || 0);

      // Update ticket price
      setFormData({
        ...formData,
        ticketPrice: newPrice,
      });

      // Calculate and display updated revenue based on sold tickets
      const revenue = (soldTickets * newPrice).toFixed(2);
      setSuccess(
        `New price: $${newPrice}. Total revenue: $${revenue} from ${soldTickets} tickets sold.`
      );
    } else {
      // Handle other form fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3003/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      setSuccess("Event updated successfully!");

      // Redirect after a brief delay
      setTimeout(() => {
        navigate(`/organizer/events/${eventId}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(
        err.message ||
          "Failed to update event. Please check your data and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/organizer/events`);
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.date &&
      formData.location &&
      formData.category &&
      formData.ticketPrice >= 0 &&
      formData.totalTickets >= soldTickets
    );
  };

  // Calculate ticket sales percentage
  const soldPercentage =
    formData.totalTickets > 0
      ? Math.round((soldTickets / formData.totalTickets) * 100)
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header with parallax effect */}
          <div className="relative mb-8 bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 opacity-90"></div>
            <div className="relative px-8 py-12 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Edit Event</h1>
                <p className="text-indigo-100 mt-2 max-w-lg">
                  Update your event details and manage ticket capacity
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || !isFormValid()}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isFormValid() && !isSaving
                      ? "bg-white text-indigo-700 hover:bg-indigo-50"
                      : "bg-white/50 text-white cursor-not-allowed"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700"
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-fadeIn">
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
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-md p-8">
              <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-gray-600 font-medium text-lg">
                Loading event details...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Event Info Card */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 transition-all hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="h-6 w-6 text-indigo-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Event Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter a catchy title for your event"
                    />
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Provide an engaging description of your event"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Event Details Card */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 transition-all hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="h-6 w-6 text-indigo-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Date & Time*
                    </label>
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Location*
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter the venue or online platform"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category*
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {formData.image && (
                    <div className="col-span-2 flex justify-center">
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Event preview"
                          className="h-64 w-full object-cover rounded-lg border border-gray-200 shadow-sm transition-all group-hover:shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/800x400?text=Image+Preview+Not+Available";
                          }}
                        />
                        <div className="absolute inset-0 bg-indigo-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tickets and Pricing Card */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 transition-all hover:shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="h-6 w-6 text-indigo-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  Tickets & Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-6">
                    <label
                      htmlFor="ticketPrice"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ticket Price ($)*
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        id="ticketPrice"
                        name="ticketPrice"
                        min="0"
                        step="0.01"
                        required
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <label
                      htmlFor="totalTickets"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Total Capacity (Tickets)*
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="totalTickets"
                        name="totalTickets"
                        min={soldTickets}
                        required
                        value={formData.totalTickets}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Min: {soldTickets} (already sold tickets)
                      </p>
                    </div>
                  </div>

                  {/* Ticket Sales Visualization */}
                  <div className="md:col-span-12">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          Ticket Sales Status
                        </h3>
                        <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">
                          {soldPercentage}% Sold
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-4 bg-gray-200 rounded-full mb-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${soldPercentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">
                            Total Capacity
                          </p>
                          <p className="text-xl font-semibold text-gray-800">
                            {formData.totalTickets}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Sold</p>
                          <p className="text-xl font-semibold text-green-600">
                            {soldTickets}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">
                            Available
                          </p>
                          <p className="text-xl font-semibold text-indigo-600">
                            {formData.remainingTickets}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-yellow-400"
                              xmlns="http://www.w3.org/2000/svg"
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
                              Increasing capacity will add more available
                              tickets. The number of sold tickets cannot be
                              modified.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form submission buttons */}
              <div className="flex justify-end space-x-4 mb-12">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isFormValid()}
                  className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                    isSaving || !isFormValid()
                      ? "bg-indigo-400 text-white cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      Saving Changes...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
