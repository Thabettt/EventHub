import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import StatCard from "../../components/dashboards/StatCard";
import RevenueChart from "../../components/dashboards/RevenueChart";
import EventsList from "../../components/dashboards/EventList";
import ActionCenter from "../../components/dashboards/ActionCenter";
import { getOrganizerDashboard } from "../../services/organizerService";

const DashboardPage = () => {
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      upcomingEvents: 0,
    },
    revenueData: [],
    recentEvents: [],
    upcomingEvents: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "Fetching dashboard data with token:",
          token ? "Token exists" : "No token"
        );
        const data = await getOrganizerDashboard(token);
        console.log("Dashboard data received:", data);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // More detailed error logging
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

        // Set some mock data for debugging
        setDashboardData({
          stats: {
            totalEvents: 0,
            totalTicketsSold: 0,
            totalRevenue: 0,
            upcomingEvents: 0,
          },
          revenueData: [],
          recentEvents: [],
          upcomingEvents: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.role === "Organizer" && token) {
      fetchDashboardData();
    } else {
      console.log("No user or token, setting loading to false");
      setIsLoading(false);
    }
  }, [currentUser, token]);

  if (!currentUser || currentUser.role !== "Organizer") {
    // TEMPORARY: Comment out auth guard to test desktop rendering
    console.log("Auth check:", { currentUser, role: currentUser?.role });
  }

  // Add your JSX return statement here
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative">
      {/* Ultimate Mobile Dashboard */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Executive Mobile Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Executive Dashboard
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  {currentUser?.name || "User"} •{" "}
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
            <div className="flex flex-col items-center justify-center h-96 px-6">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Loading Executive Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-md">
                Preparing your comprehensive business insights...
              </p>
            </div>
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
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors">
                  Retry Dashboard Load
                </button>
              </div>
            </div>
          ) : (
            <div className="pb-8">
              {/* Executive KPI Overview - Mobile Grid */}
              <div className="px-6 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Total Revenue KPI */}
                  <div className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">💰</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">$0</div>
                          <div className="text-xs opacity-75">
                            monthly change
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        ${dashboardData.stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-emerald-100 font-bold text-sm mb-3">
                        Total Revenue
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-white/40 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Total Events KPI */}
                  <div className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">📅</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">0</div>
                          <div className="text-xs opacity-75">total events</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.totalEvents}
                      </div>
                      <div className="text-blue-100 font-bold text-sm mb-3">
                        Total Events
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-white/40 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tickets Sold KPI */}
                  <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">🎟️</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">0</div>
                          <div className="text-xs opacity-75">tickets sold</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.totalTicketsSold.toLocaleString()}
                      </div>
                      <div className="text-orange-100 font-bold text-sm mb-3">
                        Tickets Sold
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-white/40 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Events KPI */}
                  <div className="group relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">🗓️</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold opacity-90">0</div>
                          <div className="text-xs opacity-75">upcoming</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-1">
                        {dashboardData.stats.upcomingEvents}
                      </div>
                      <div className="text-violet-100 font-bold text-sm mb-3">
                        Upcoming Events
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-white/40 rounded-full"></div>
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
                        Quick Actions
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Essential tools on the go
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/organizer/events/create"
                      className="group block bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">✨</span>
                        </div>
                        <div className="text-sm font-black text-indigo-900 dark:text-indigo-100 mb-1">
                          Create Event
                        </div>
                        <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                          Add new event
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/organizer/events"
                      className="group block bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">📋</span>
                        </div>
                        <div className="text-sm font-black text-blue-900 dark:text-blue-100 mb-1">
                          My Events
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          Manage events
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/organizer/attendees"
                      className="group block bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg">👥</span>
                        </div>
                        <div className="text-sm font-black text-emerald-900 dark:text-emerald-100 mb-1">
                          Attendees
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          View people
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/organizer/analytics"
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
                          View stats
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Today's Schedule - Mobile */}
              <div className="px-6 mb-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                        Today's Schedule
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        What's happening now
                      </p>
                    </div>
                    <Link
                      to="/organizer/events"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-black transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  {dashboardData.upcomingEvents &&
                  dashboardData.upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.upcomingEvents
                        .slice(0, 2)
                        .map((event, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/30 dark:to-blue-900/20 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                              <span className="text-white text-lg">🎉</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {event.title || "Upcoming Event"}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {event.date || "Today"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                89
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                attendees
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📅</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                        No events today
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                        Create your next event
                      </p>
                      <Link
                        to="/organizer/events/create"
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all duration-300 active:scale-95"
                      >
                        <span>✨</span>
                        <span>Create Event</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ultimate Executive Desktop Dashboard */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10 overflow-hidden">
          {/* Main Content Area - Full Width */}
          <div className="flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Executive Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      Welcome back, {currentUser?.name || "User"} •{" "}
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Revenue Status
                    </span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      0%
                    </span>
                  </div>
                  <Link
                    to="/organizer/events/create"
                    className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <span className="text-lg">✨</span>
                      <span>Create Event</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Loading Executive Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Preparing your comprehensive business insights and
                    analytics...
                  </p>
                </div>
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
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors">
                      Retry Dashboard Load
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Executive KPI Overview */}
                  <div className="grid grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue KPI */}
                    <div className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">💰</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              $0
                            </div>
                            <div className="text-xs opacity-75">
                              monthly change
                            </div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          ${dashboardData.stats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-emerald-100 font-bold text-lg mb-4">
                          Total Revenue
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div className="w-0 h-full bg-white/40 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Total Events KPI */}
                    <div className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">📅</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              0
                            </div>
                            <div className="text-xs opacity-75">
                              total events
                            </div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.totalEvents}
                        </div>
                        <div className="text-blue-100 font-bold text-lg mb-4">
                          Total Events
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div className="w-0 h-full bg-white/40 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Tickets Sold KPI */}
                    <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🎟️</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              0
                            </div>
                            <div className="text-xs opacity-75">
                              tickets sold
                            </div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.totalTicketsSold.toLocaleString()}
                        </div>
                        <div className="text-orange-100 font-bold text-lg mb-4">
                          Tickets Sold
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div className="w-0 h-full bg-white/40 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Events KPI */}
                    <div className="group relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🗓️</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold opacity-90">
                              0
                            </div>
                            <div className="text-xs opacity-75">upcoming</div>
                          </div>
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {dashboardData.stats.upcomingEvents}
                        </div>
                        <div className="text-violet-100 font-bold text-lg mb-4">
                          Upcoming Events
                        </div>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                          <div className="w-0 h-full bg-white/40 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-12 gap-8">
                    {/* Revenue Analytics - Large Chart */}
                    <div className="col-span-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Revenue Analytics
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Comprehensive financial performance overview
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-2xl">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                              Revenue
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-2xl">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                              Tickets
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <RevenueChart data={dashboardData.revenueData} />
                      </div>
                      <div className="grid grid-cols-3 gap-6 mt-6">
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mb-1">
                            $
                            {(() => {
                              const currentMonth =
                                new Date().toLocaleDateString("en-US", {
                                  month: "short",
                                });
                              const currentMonthData =
                                dashboardData.revenueData.find(
                                  (item) => item.month === currentMonth
                                );
                              return currentMonthData
                                ? currentMonthData.revenue.toLocaleString()
                                : "0";
                            })()}
                          </div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            This Month
                          </div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mb-1">
                            $
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const quarterStart =
                                Math.floor(currentMonth / 3) * 3;
                              const quarterMonths = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ].slice(quarterStart, quarterStart + 3);
                              const quarterRevenue = dashboardData.revenueData
                                .filter((item) =>
                                  quarterMonths.includes(item.month)
                                )
                                .reduce((sum, item) => sum + item.revenue, 0);
                              return quarterRevenue.toLocaleString();
                            })()}
                          </div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            This Quarter
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mb-1">
                            $
                            {(() => {
                              const currentYear = new Date().getFullYear();
                              const currentMonthIndex = new Date().getMonth();
                              const monthsThisYear = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ].slice(0, currentMonthIndex + 1);
                              const yearToDateRevenue =
                                dashboardData.revenueData
                                  .filter((item) =>
                                    monthsThisYear.includes(item.month)
                                  )
                                  .reduce((sum, item) => sum + item.revenue, 0);
                              return yearToDateRevenue.toLocaleString();
                            })()}
                          </div>
                          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            Year to Date
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Action Center */}
                    <div className="col-span-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
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
                          to="/organizer/analytics"
                          className="group block w-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white text-lg">📊</span>
                            </div>
                            <div>
                              <div className="text-base font-black text-indigo-900 dark:text-indigo-100 mb-1">
                                Advanced Analytics
                              </div>
                              <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                                Deep business insights
                              </div>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/organizer/events"
                          className="group block w-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white text-lg">🎯</span>
                            </div>
                            <div>
                              <div className="text-base font-black text-blue-900 dark:text-blue-100 mb-1">
                                Event Management
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Manage all events
                              </div>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/organizer/attendees"
                          className="group block w-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-lg transition-all duration-300 active:scale-95"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white text-lg">👥</span>
                            </div>
                            <div>
                              <div className="text-base font-black text-emerald-900 dark:text-emerald-100 mb-1">
                                Attendee Intelligence
                              </div>
                              <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                Audience insights
                              </div>
                            </div>
                          </div>
                        </Link>

                        {/* Notifications Card - Now matches the style above */}
                        <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50 overflow-hidden">
                          <Link
                            to="/organizer/notifications"
                            className="group block px-6 py-6 hover:shadow-lg transition-all duration-300 active:scale-95"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-lg">🔔</span>
                              </div>
                              <div>
                                <div className="text-base font-black text-orange-900 dark:text-orange-100 mb-1">
                                  Notifications
                                </div>
                                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                                  Recent activity updates
                                </div>
                              </div>
                            </div>
                          </Link>

                          <div className="px-6 pb-6">
                            <div
                              className="max-h-32 overflow-y-auto scrollbar-hide space-y-2"
                              style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                              }}
                            >
                              <style jsx>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                  display: none;
                                }
                              `}</style>

                              <div className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg border border-orange-100/50 dark:border-orange-800/30">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    New booking for "Summer Music Festival"
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    2 minutes ago
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-3 bg-white/40 dark:bg-gray-800/30 rounded-lg border border-orange-100/30 dark:border-orange-800/20">
                                <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    Event "Tech Conference 2025" is 80% sold out
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    1 hour ago
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-3 bg-white/40 dark:bg-gray-800/30 rounded-lg border border-orange-100/30 dark:border-orange-800/20">
                                <div className="w-2 h-2 bg-orange-300 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    Payment received for "Art Workshop Series"
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    3 hours ago
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-3 bg-white/40 dark:bg-gray-800/30 rounded-lg border border-orange-100/30 dark:border-orange-800/20">
                                <div className="w-2 h-2 bg-orange-300 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    Reminder: Event review pending for "Food
                                    Festival"
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    1 day ago
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent and Upcoming Events */}
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    {/* Recent Events */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            Recent Events
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            Latest event performance
                          </p>
                        </div>
                        <Link
                          to="/organizer/events"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-black transition-colors"
                        >
                          View All →
                        </Link>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <EventsList
                          events={dashboardData.recentEvents}
                          type="recent"
                        />
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            Upcoming Events
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            Future event pipeline
                          </p>
                        </div>
                        <Link
                          to="/organizer/events"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-black transition-colors"
                        >
                          View All →
                        </Link>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <EventsList
                          events={dashboardData.upcomingEvents}
                          type="upcoming"
                        />
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
