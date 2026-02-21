import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { getSessionStatus } from "../../services/bookingService";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import Footer from "../../components/layout/Footer";

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { currentUser: user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!sessionId) {
        setError(
          "No session ID found. Please check your booking from your profile.",
        );
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await getSessionStatus(token, sessionId);
        setPaymentStatus(response.data.paymentStatus);
        setBooking(response.data.booking);
      } catch (err) {
        console.error("Error fetching session status:", err);
        setError(
          "Unable to verify payment. Please check your bookings in your profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex items-center justify-center h-[70vh]">
          <LoadingSpinner size="lg" message="Verifying your payment..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <motion.div
            className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Payment Verification Issue
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
            <Link
              to="/tickets"
              className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              View My Tickets
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-24">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Success Header */}
          <div
            className={`p-8 text-center ${isPaid ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-yellow-500 to-orange-500"}`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {isPaid ? (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">
              {isPaid ? "Payment Successful!" : "Processing Payment..."}
            </h1>
            <p className="text-white/80 text-lg">
              {isPaid
                ? "Your tickets are confirmed"
                : "Your payment is being processed"}
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-8 space-y-6">
            {booking && (
              <>
                {/* Event Info */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Event Details
                  </h3>
                  <div className="flex items-start gap-4">
                    {booking.event?.image && (
                      <img
                        src={booking.event.image}
                        alt={booking.event?.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {booking.event?.title || "Event"}
                      </h4>
                      {booking.event?.date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(booking.event.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      )}
                      {booking.event?.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {booking.event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl text-center">
                    <div className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      Tickets
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">
                      {booking.ticketsBooked}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl text-center">
                    <div className="text-sm font-bold text-green-500 dark:text-green-400 uppercase tracking-wider mb-1">
                      Total Paid
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">
                      ${booking.totalPrice?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Booking Reference */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-center">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Booking Reference
                  </div>
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {booking._id}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                to="/tickets"
                className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-indigo-500/20"
              >
                View My Tickets
              </Link>
              <Link
                to="/events"
                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl text-center transition-colors"
              >
                Browse More Events
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccessPage;
