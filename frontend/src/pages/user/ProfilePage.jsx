import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile, changePassword } from "../../services/userService";
import PasswordChangeModal from "../../components/user/PasswordChangeModal";

// Icon components for consistent styling
const Icons = {
  Success: () => (
    <svg
      className="h-5 w-5 text-green-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Error: () => (
    <svg
      className="h-5 w-5 text-red-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Edit: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  Password: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Calendar: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Clock: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Event: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      <path
        fillRule="evenodd"
        d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Explore: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Logout: () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12.59L5.41 11H9V9H5.41L10 4.41 8.59 3 2 9.59 8.59 16 10 14.59z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Card component for consistent styling
const Card = ({ children, className, heading, gradient }) => (
  <motion.div
    className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-gray-900/20 overflow-hidden mb-8 ${
      className || ""
    }`}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {heading && (
      <div
        className={`${
          gradient || "bg-gradient-to-r from-indigo-600 to-purple-600"
        } px-6 py-4`}
      >
        <h2 className="text-white text-xl font-semibold">{heading}</h2>
      </div>
    )}
    <div className="p-6">{children}</div>
  </motion.div>
);

// Message alert component with fixed styling
const Alert = ({ type, message, onClose }) => (
  <motion.div
    className="mb-6"
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className={
        type === "success"
          ? "bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-l-4 border-green-400"
          : "bg-red-50 dark:bg-red-900/20 p-4 rounded-md border-l-4 border-red-400"
      }
    >
      <div className="flex justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            {type === "success" ? <Icons.Success /> : <Icons.Error />}
          </div>
          <div className="ml-3">
            <p
              className={
                type === "success"
                  ? "text-sm text-green-800 dark:text-green-200"
                  : "text-sm text-red-800 dark:text-red-200"
              }
            >
              {message}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// Booking status component with proper color coding
const BookingStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

// Booking item component
// Update the BookingItem component to display price information

const BookingItem = ({ booking }) => (
  <motion.div
    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600"
    whileHover={{ scale: 1.01, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex justify-between items-center">
      <div className="pr-4 flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {booking.eventName}
        </h3>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div className="flex items-center">
            <Icons.Calendar />
            <span className="ml-2">
              {new Date(booking.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Icons.Clock />
            <span className="ml-2">{booking.time}</span>
          </div>
          {booking.totalPrice && (
            <div className="flex items-center">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246-.48-.32-1.054-.545-1.676-.662V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 font-medium">
                ${booking.totalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <BookingStatus status={booking.status} />
        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {booking.ticketType}
        </p>
      </div>
    </div>
  </motion.div>
);
const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loading: authLoading } = useAuth();
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
  });

  // Custom CSS for autofill styling compatibility
  const autofillStyles = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
      -webkit-text-fill-color: #111827 !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    
    .dark input:-webkit-autofill,
    .dark input:-webkit-autofill:hover,
    .dark input:-webkit-autofill:focus,
    .dark input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #374151 inset !important;
      -webkit-text-fill-color: #f9fafb !important;
    }
  `;

  // Effect for initializing user data
  useEffect(() => {
    if (!authLoading && currentUser) {
      // Initialize user profile with current user data
      setUserProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });

      // Fetch user's bookings
      fetchUserBookings();
    }
  }, [authLoading, currentUser]);

  // Simulated API call to fetch user bookings
  // Inside the ProfilePage component, replace the existing fetchUserBookings function:

  const fetchUserBookings = async () => {
    setIsLoading(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      // Make API call to fetch user's bookings
      const response = await fetch("http://localhost:3003/api/bookings/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Format the bookings data to match the expected format in our component
        const formattedBookings = result.data.map((booking) => ({
          id: booking._id,
          eventName: booking.event.title,
          date: booking.event.date,
          time: new Date(booking.event.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: booking.status,
          ticketType: `${booking.ticketsBooked} ticket${
            booking.ticketsBooked > 1 ? "s" : ""
          }`,
          totalPrice: booking.totalPrice,
        }));
        setUserBookings(formattedBookings);
      } else {
        setUserBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, msg, duration = 5000) => {
    if (type === "success") {
      setSuccessMessage(msg);
      setError("");
    } else {
      setError(msg);
      setSuccessMessage("");
    }

    if (duration) {
      const timer = setTimeout(() => {
        if (type === "success") {
          setSuccessMessage("");
        } else {
          setError("");
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      // Replace with actual API call
      await changePassword(currentPassword, newPassword);
      setIsPasswordModalOpen(false);
      showMessage("success", "Password changed successfully!");
      return true;
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle different error cases
      let errorMessage = "Failed to change password. Please try again.";

      if (error.message) {
        if (error.message.toLowerCase().includes("current password")) {
          errorMessage =
            "Your current password is incorrect. Please try again.";
        } else if (error.message.toLowerCase().includes("requirements")) {
          errorMessage = error.message;
        } else if (error.message.toLowerCase().includes("token")) {
          errorMessage = "Your session has expired. Please log in again.";
        } else {
          errorMessage = error.message;
        }
      }

      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map((err) => err.msg).join(", ");
      }

      showMessage("error", errorMessage, 8000);
      throw new Error(errorMessage);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Replace with actual API call
      // await updateProfile(userProfile);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      showMessage("success", "Profile updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      showMessage("error", "Failed to log out. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 h-full w-full overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 h-full w-full overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900">
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 -left-10 w-[50%] h-[55%] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-80 blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, 20, 0],
                scale: [1, 1.06, 0.98, 1],
                opacity: [0.6, 0.8, 0.6],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute bottom-0 right-0 w-[60%] h-[65%] rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-80 blur-3xl"
              animate={{
                x: [0, -25, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 0.95, 1],
                opacity: [0.6, 0.8, 0.7, 0.6],
                rotate: [0, -3, 0],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Not authenticated content */}
        <div className="relative min-h-screen flex flex-col justify-center items-center z-10 px-4 py-12">
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 w-full max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mx-auto w-12 h-12 mb-6 bg-purple-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>

            <h2 className="text-center text-xl font-medium text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Please log in to view your profile
            </p>

            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />
      <div className="relative min-h-screen">
        {/* Fixed background that stays in place during scrolling */}
        <div className="fixed inset-0 z-0 bg-gray-50 dark:bg-gray-900">
          <div className="absolute inset-0">
            {/* Main flowing gradient blob */}
            <motion.div
              className="absolute top-0 -right-10 w-[55%] h-[55%] rounded-full bg-gradient-to-r from-blue-200 via-indigo-200 to-indigo-300 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 opacity-70 blur-3xl"
              animate={{
                x: [0, 20, 0],
                y: [0, 15, 0],
                scale: [1, 1.05, 0.98, 1],
                opacity: [0.5, 0.65, 0.55, 0.5],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1],
              }}
            />

            {/* Secondary flowing gradient blob */}
            <motion.div
              className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:from-purple-500 dark:via-pink-500 dark:to-blue-500 opacity-70 blur-3xl"
              animate={{
                x: [0, -20, 0],
                y: [0, -15, 0],
                scale: [1, 1.08, 0.95, 1],
                opacity: [0.5, 0.7, 0.6, 0.5],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.4, 0.7, 1],
              }}
            />

            {/* Smaller accent gradient blob */}
            <motion.div
              className="absolute top-1/3 left-1/4 w-[30%] h-[30%] rounded-full bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100 dark:from-indigo-500 dark:via-teal-500 dark:to-purple-500 opacity-50 blur-3xl"
              animate={{
                x: [0, 40, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 0.9, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />

            {/* Floating particle effects */}
            <div className="absolute inset-0 opacity-30 dark:opacity-80">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white dark:bg-purple-600"
                  style={{
                    width: Math.random() * 4 + 2 + "px",
                    height: Math.random() * 4 + 2 + "px",
                    top: Math.random() * 100 + "%",
                    left: Math.random() * 100 + "%",
                  }}
                  animate={{
                    y: [0, -(Math.random() * 100 + 50)],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: Math.random() * 6 + 8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: Math.random() * 4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content that moves normally */}
        <div className="relative z-10 min-h-screen pt-12 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Page header */}
            <motion.div
              className="text-center mb-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            ></motion.div>

            {/* Success and Error Messages */}
            <AnimatePresence>
              {successMessage && (
                <Alert
                  type="success"
                  message={successMessage}
                  onClose={() => setSuccessMessage("")}
                />
              )}

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              )}
            </AnimatePresence>

            {/* User Information Card */}
            <Card heading="Account Information">
              {isEditMode ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={userProfile.name}
                          onChange={handleProfileInputChange}
                          className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={userProfile.email}
                          onChange={handleProfileInputChange}
                          className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isLoading}
                      >
                        Cancel
                      </motion.button>

                      <motion.button
                        type="submit"
                        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center ${
                          isLoading ? "opacity-80" : ""
                        }`}
                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                        whileTap={{ scale: isLoading ? 1 : 0.99 }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
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
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 sm:mb-0 sm:mr-4">
                      {currentUser.name
                        ? currentUser.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white break-words">
                        {currentUser.name || "User"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 break-words">
                        {currentUser.email}
                      </p>
                      <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm px-2 py-1 rounded mt-1">
                        {currentUser.role || "Standard User"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Member since
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currentUser.createdAt
                            ? new Date(
                                currentUser.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Last login
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currentUser.lastLogin
                            ? new Date(currentUser.lastLogin).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : new Date().toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Actions Card */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Account Management
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isEditMode}
                >
                  <Icons.Edit />
                  <span>Edit Profile</span>
                </motion.button>

                <motion.button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icons.Password />
                  <span>Change Password</span>
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icons.Logout />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </Card>

            {/* Recent Bookings Section */}
            <Card heading="Recent Bookings">
              {isLoading ? (
                <div className="text-center py-8">
                  <motion.div
                    className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading your bookings...
                  </p>
                </div>
              ) : userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <BookingItem key={booking.id} booking={booking} />
                  ))}

                  {userBookings.length >= 3 && (
                    <div className="pt-4 text-center">
                      <Link
                        to="/bookings"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm inline-flex items-center"
                      >
                        View all bookings
                        <svg
                          className="ml-1 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Icons.Event className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    You haven't booked any events yet.
                  </p>
                  <motion.button
                    className="mt-4 flex items-center justify-center space-x-2 py-2 px-6 mx-auto border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/events")}
                  >
                    <Icons.Explore />
                    <span>Explore Events</span>
                  </motion.button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordChange}
        />
      </div>
    </>
  );
};

export default ProfilePage;
