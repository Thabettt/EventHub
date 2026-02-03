import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import Button from "../../components/common/Button";
import { getAdminDashboard } from "../../services/adminService";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

const DashboardPage = () => {
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalOrganizers: 0,
      totalEvents: 0,
      pendingEvents: 0,
      totalBookings: 0,
      totalRevenue: 0,
    },
    recentEvents: [],
    recentBookings: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching admin dashboard data...");
        const data = await getAdminDashboard(token);
        console.log("Admin dashboard data received:", data);

        // Transform the API data to match our component structure
        setDashboardData({
          stats: {
            totalUsers: data.counts?.users || 0,
            totalOrganizers: data.counts?.organizers || 0,
            totalEvents: data.counts?.events || 0,
            pendingEvents: 0,
            totalBookings: data.counts?.bookings || 0,
            totalRevenue: data.counts?.revenue || 0,
          },
          recentEvents: data.recentEvents || [],
          recentBookings: data.recentBookings || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        if (error.response) {
          console.error(
            "Response error:",
            error.response.status,
            error.response.data
          );
          setError(
            `Server error (${error.response.status}): ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          console.error("Request error:", error.request);
          setError(
            "Network error: Unable to connect to server. Please check your connection."
          );
        } else {
          console.error("General error:", error.message);
          setError(`Error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.role === "System Admin" && token) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, token]);

  if (!currentUser || currentUser.role !== "System Admin") {
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
            You must be logged in as a system administrator to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative">
      {/* Mobile Dashboard */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Mobile Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  {currentUser?.name || "Administrator"} •{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner
              variant="page"
              size="lg"
              message="Loading Admin Dashboard"
              subMessage="Preparing your administrative overview..."
            />
          ) : error ? (
            <div className="px-6 pt-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-6 rounded-3xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-bold text-lg">
                      Dashboard Error
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="danger"
                  size="default"
                >
                  Retry Dashboard Load
                </Button>
              </div>
            </div>
          ) : (
            <div className="pb-8">
              {/* Mobile KPI Overview */}
              <div className="px-6 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Total Users */}
                  <div className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">👥</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">
                            {dashboardData.stats.totalOrganizers}
                          </div>
                          <div className="text-xs opacity-75">organizers</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.totalUsers.toLocaleString()}
                      </div>
                      <div className="text-blue-100 font-bold text-sm">
                        Total Users
                      </div>
                    </div>
                  </div>

                  {/* Total Events */}
                  <div className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">🎉</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">
                            {dashboardData.stats.pendingEvents}
                          </div>
                          <div className="text-xs opacity-75">pending</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.totalEvents}
                      </div>
                      <div className="text-emerald-100 font-bold text-sm">
                        Total Events
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Total Bookings */}
                  <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">🎫</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.totalBookings.toLocaleString()}
                      </div>
                      <div className="text-orange-100 font-bold text-sm mb-3">
                        Total Bookings
                      </div>
                    </div>
                  </div>

                  {/* Platform Revenue */}
                  <div className="group relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">💰</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        ${dashboardData.stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-violet-100 font-bold text-sm mb-3">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Mobile */}
              <div className="px-6 mb-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                        Admin Actions
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Platform management tools
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🛠️</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/admin/users"
                      className="group block bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">👥</span>
                        </div>
                        <div className="text-sm font-black text-indigo-900 dark:text-indigo-100 mb-1">
                          User Management
                        </div>
                        <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                          Manage users
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin/events"
                      className="group block bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">🎉</span>
                        </div>
                        <div className="text-sm font-black text-blue-900 dark:text-blue-100 mb-1">
                          Event Approval
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          Review events
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className="group block bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">🎫</span>
                        </div>
                        <div className="text-sm font-black text-emerald-900 dark:text-emerald-100 mb-1">
                          Bookings
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          Manage bookings
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className="group block bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">📊</span>
                        </div>
                        <div className="text-sm font-black text-orange-900 dark:text-orange-100 mb-1">
                          Analytics
                        </div>
                        <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                          View insights
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pending Approvals - Mobile */}
              <div className="px-6 mb-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                        Recent Events
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Latest events on the platform
                      </p>
                    </div>
                    <Link
                      to="/admin/events"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-black transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  {dashboardData.recentEvents.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentEvents.slice(0, 3).map((event) => (
                        <div
                          key={event._id}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 pr-2">
                              <Link
                                to={`/admin/events/${event._id}`}
                                className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1"
                              >
                                {event.title}
                              </Link>
                              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                <span>📅</span>
                                <span>
                                  {new Date(event.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                <span>📍</span>
                                <span className="truncate max-w-[150px]">
                                  {event.location}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                $
                                {event.price?.toFixed(2) ||
                                  event.ticketPrice?.toFixed(2) ||
                                  "0.00"}
                              </div>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 mt-1">
                                {event.category}
                              </span>
                            </div>
                          </div>

                          {/* Simplified Progress for Mobile Dashboard */}
                          {event.totalTickets && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-gray-500">Sold</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {event.totalTickets -
                                    (event.availableTickets ||
                                      event.remainingTickets ||
                                      0)}
                                  /{event.totalTickets}
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-indigo-500 h-1 rounded-full"
                                  style={{
                                    width: `${
                                      (100 *
                                        (event.totalTickets -
                                          (event.availableTickets ||
                                            event.remainingTickets ||
                                            0))) /
                                      event.totalTickets
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <Button
                            to={`/admin/events/${event._id}`}
                            variant="primary"
                            size="small"
                            className="w-full !py-2 !text-xs"
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No recent events found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Dashboard */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10 overflow-hidden">
          <div className="flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      Platform Overview • {currentUser?.name || "Administrator"}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              {isLoading ? (
                <LoadingSpinner
                  variant="page"
                  size="xl"
                  message="Loading Admin Dashboard"
                  subMessage="Preparing comprehensive administrative analytics..."
                />
              ) : error ? (
                <div className="max-w-2xl mx-auto mt-16">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-8 rounded-3xl shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mr-6">
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                          Dashboard Error
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="danger"
                      size="default"
                    >
                      Retry Dashboard Load
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop KPI Overview */}
                  <div className="grid grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">👥</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              {dashboardData.stats.totalOrganizers}
                            </div>
                            <div className="text-xs opacity-75">organizers</div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.totalUsers.toLocaleString()}
                        </div>
                        <div className="text-blue-100 font-bold text-lg mb-4">
                          Total Users
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Total Events */}
                    <div className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🎉</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              {dashboardData.stats.pendingEvents}
                            </div>
                            <div className="text-xs opacity-75">pending</div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.totalEvents}
                        </div>
                        <div className="text-emerald-100 font-bold text-lg mb-4">
                          Total Events
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Total Bookings */}
                    <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🎫</span>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.totalBookings.toLocaleString()}
                        </div>
                        <div className="text-orange-100 font-bold text-lg mb-4">
                          Total Bookings
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full"
                            style={{ width: "45%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Platform Revenue */}
                    <div className="group relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">💰</span>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          ${dashboardData.stats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-violet-100 font-bold text-lg mb-4">
                          Total Revenue
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-12 gap-8">
                    {/* Recent Events Section */}
                    <div className="col-span-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 h-[600px] flex flex-col">
                      <div className="flex items-center justify-between mb-8 flex-shrink-0">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Recent Events
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Latest events created on the platform
                          </p>
                        </div>
                        <Button
                          to="/admin/events"
                          variant="primary"
                          size="default"
                        >
                          View All Events
                        </Button>
                      </div>

                      {dashboardData.recentEvents.length > 0 ? (
                        <div className="overflow-y-auto overflow-x-hidden flex-1 -mx-8 px-8 custom-scrollbar">
                          <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Event Details
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Ticket Stats
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                              {dashboardData.recentEvents.map((event) => (
                                <tr
                                  key={event._id}
                                  className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors duration-200"
                                >
                                  <td className="px-6 py-4">
                                    <div>
                                      <Link
                                        to={`/admin/events/${event._id}`}
                                        className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                                      >
                                        {event.title}
                                      </Link>
                                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <span>📍</span>
                                        <span className="truncate max-w-[200px]">
                                          {event.location}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500 dark:text-gray-500">
                                        <span>📅</span>
                                        <span>
                                          {new Date(event.date).toLocaleDateString(
                                            "en-US",
                                            {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            }
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                                      {event.category || "Uncategorized"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {event.totalTickets ? (
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="font-bold text-gray-900 dark:text-white">
                                            {event.totalTickets -
                                              (event.availableTickets ||
                                                event.remainingTickets ||
                                                0)}
                                            /{event.totalTickets}
                                          </span>
                                        </div>
                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                              width: `${
                                                (100 *
                                                  (event.totalTickets -
                                                    (event.availableTickets ||
                                                      event.remainingTickets ||
                                                      0))) /
                                                event.totalTickets
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">
                                        No Limit
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                      $
                                      {event.ticketPrice?.toFixed(2) ||
                                        "0.00"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Button
                                      to={`/admin/events/${event._id}`}
                                      variant="primary"
                                      size="small"
                                      className="!px-4 !py-2 !text-sm whitespace-nowrap"
                                    >
                                      Review
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                            <span className="text-4xl">📋</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            No Recent Events
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Events will appear here as they are created
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions Sidebar */}
                    <div className="col-span-4 space-y-6">
                      {/* Admin Actions */}
                      {/* Executive Action Center */}
                      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                              Executive Actions
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              Strategic management tools
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xl">⚡</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Link
                            to="/admin/users"
                            className="group block w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-lg">👥</span>
                              </div>
                              <div>
                                <div className="text-base font-black text-blue-900 dark:text-blue-100 mb-1">
                                  User Management
                                </div>
                                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                  Manage platform users
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/admin/bookings"
                            className="group block w-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-lg">🎫</span>
                              </div>
                              <div>
                                <div className="text-base font-black text-emerald-900 dark:text-emerald-100 mb-1">
                                  Manage Bookings
                                </div>
                                <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                  Oversee reservations
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/admin/analytics"
                            className="group block w-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-lg">📊</span>
                              </div>
                              <div>
                                <div className="text-base font-black text-violet-900 dark:text-violet-100 mb-1">
                                  Platform Analytics
                                </div>
                                <div className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                                  Deep business insights
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
