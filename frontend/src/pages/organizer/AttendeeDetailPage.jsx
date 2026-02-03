import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAttendeeBookings } from "../../services/bookingService";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import { formatDateShort } from "../../utils/formatDate";
import StatCard from "../../components/dashboards/StatCard";
import Button from "../../components/common/Button";

const AttendeeDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const deviceInfo = useDeviceDetection();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await getAttendeeBookings(token, id);
        if (!mounted) return;
        if (data?.data?.attendee) {
          setAttendee(data.data.attendee);
          setBookings(data.data.bookings || []);
        } else if (Array.isArray(data.data)) {
          const list = data.data;
          setBookings(list);
          setAttendee(list[0]?.user || list[0]?.attendee || null);
        } else if (data?.data && Array.isArray(data.data.bookings)) {
          setAttendee(data.data.attendee || null);
          setBookings(data.data.bookings);
        } else {
          setBookings(data.data || []);
        }
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load attendee details"
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const revenue = bookings.reduce(
      (s, b) =>
        s +
        (b.totalPrice ||
          (b.ticketPrice || 0) * (b.ticketsBooked || b.quantity || 1) ||
          0),
      0
    );
    const last = bookings[0] || null;
    const avgSpend = total > 0 ? revenue / total : 0;
    return { total, revenue, last, avgSpend };
  }, [bookings]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative">
      {/* Mobile Layout */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Mobile Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Attendee Profile
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  Detailed analytics and insights
                </p>
              </div>
              <Button variant="back" size="small">
                Back
              </Button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="px-4 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative mb-6">
                  <div className="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-3 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Loading Profile
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
                  Fetching attendee data...
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
                      Error Loading Profile
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Profile Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {getInitials(
                          attendee?.name ||
                            attendee?.fullName ||
                            attendee?.attendeeName
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-black text-gray-900 dark:text-white truncate">
                        {attendee?.name ||
                          attendee?.fullName ||
                          attendee?.attendeeName ||
                          "Unnamed Attendee"}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {attendee?.email || "No email provided"}
                      </p>

                    </div>
                  </div>

                  {/* Mobile Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {stats.total}
                      </div>
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Total Bookings
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ${stats.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Lifetime Revenue
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">📱</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {attendee?.phone || attendee?.phoneNumber || "No phone"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">📅</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Joined{" "}
                        {formatDate(
                          attendee?.createdAt || attendee?.registeredAt
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">💰</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Avg Spend: ${stats.avgSpend.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Booking History */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Booking History
                    </h3>
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📋</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        No Bookings Yet
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        This attendee hasn't made any bookings
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking, index) => (
                        <div
                          key={booking._id || booking.id || index}
                          className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                {booking.event?.title ||
                                  booking.eventTitle ||
                                  booking.title ||
                                  "Event"}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-gray-400 text-xs">
                                  📅
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatDate(
                                    booking.event?.date ||
                                      booking.date ||
                                      booking.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                $
                                {(
                                  booking.totalPrice ||
                                  (booking.ticketPrice || 0) *
                                    (booking.ticketsBooked ||
                                      booking.quantity ||
                                      1)
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {booking.ticketsBooked || booking.quantity || 1}{" "}
                                tickets
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                              {booking.ticketName ||
                                booking.ticketType ||
                                "Standard"}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                              ✓ Confirmed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10 overflow-hidden">
          <div className="flex flex-col min-h-screen">
            {/* Desktop Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Attendee Profile
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      Comprehensive attendee analytics and booking intelligence
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="back">Back to Attendees</Button>
                </div>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Loading Attendee Profile
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Fetching comprehensive attendee data and booking
                    analytics...
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
                        Profile Loading Error
                      </h3>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="danger"
                    size="default"
                  >
                    Retry Loading
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
                  {/* Desktop Profile Card */}
                  <div className="xl:col-span-1 h-full">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 h-full overflow-y-auto custom-scrollbar">
                      {/* Profile Header */}
                      <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4">
                          <span className="text-white font-bold text-2xl">
                            {getInitials(
                              attendee?.name ||
                                attendee?.fullName ||
                                attendee?.attendeeName
                            )}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                          {attendee?.name ||
                            attendee?.fullName ||
                            attendee?.attendeeName ||
                            "Unnamed Attendee"}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {attendee?.email || "No email provided"}
                        </p>

                      </div>

                      {/* Profile Stats */}
                      <div className="space-y-4 mb-8">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                {stats.total}
                              </div>
                              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Total Bookings
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                                🎫
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                ${stats.revenue.toLocaleString()}
                              </div>
                              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Lifetime Revenue
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                              <span className="text-emerald-600 dark:text-emerald-400 text-xl">
                                💰
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                                ${stats.avgSpend.toFixed(0)}
                              </div>
                              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Average Spend
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                              <span className="text-amber-600 dark:text-amber-400 text-xl">
                                📊
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                📱
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {attendee?.phone ||
                                  attendee?.phoneNumber ||
                                  "No phone provided"}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                Phone Number
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                📅
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatDate(
                                  attendee?.createdAt || attendee?.registeredAt
                                )}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                Registration Date
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Booking History */}
                  <div className="xl:col-span-2 h-full">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-full flex flex-col">
                      <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                              Booking History
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              Complete booking timeline and transaction details
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">📋</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                        {bookings.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                              <span className="text-4xl">📋</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                              No Booking History
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              This attendee hasn't made any bookings yet. Once
                              they purchase tickets, their booking history will
                              appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bookings.map((booking, index) => (
                              <div
                                key={booking._id || booking.id || index}
                                className="bg-gray-50/70 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 transition-all duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold">
                                        🎫
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {booking.event?.title ||
                                          booking.eventTitle ||
                                          booking.title ||
                                          "Event"}
                                      </h4>
                                      <div className="flex items-center space-x-4 mt-1">
                                        <div className="flex items-center space-x-1">
                                          <span className="text-gray-400 text-sm">
                                            📅
                                          </span>
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(
                                              booking.event?.date ||
                                                booking.date ||
                                                booking.createdAt
                                            )}
                                          </span>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                                          {booking.ticketName ||
                                            booking.ticketType ||
                                            "Standard"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                                      $
                                      {(
                                        booking.totalPrice ||
                                        (booking.ticketPrice || 0) *
                                          (booking.ticketsBooked ||
                                            booking.quantity ||
                                            1)
                                      ).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {booking.ticketsBooked ||
                                        booking.quantity ||
                                        1}{" "}
                                      tickets purchased
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 mt-2">
                                      Confirmed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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

export default AttendeeDetailPage;
