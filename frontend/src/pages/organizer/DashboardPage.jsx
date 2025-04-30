import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/dashboards/StatCard";
import RevenueChart from "../../components/dashboards/RevenueChart";
import EventsList from "../../components/dashboards/EventList";
import ActionCenter from "../../components/dashboards/ActionCenter";
import OrganizerSidebar from "../../components/layout/OrganizerSidebar";
import { getOrganizerDashboard } from "../../services/organizerService";

const DashboardPage = () => {
  const { currentUser, token } = useAuth();
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
              error.response.data.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          console.error("Request error - no response received");
          setError(
            "Network error: Could not reach the server. Please check your connection."
          );
        } else {
          setError(
            error.message ||
              "Failed to load dashboard data. Please try again later."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.role === "Organizer" && token) {
      fetchDashboardData();
    }
  }, [currentUser, token]);

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
      <OrganizerSidebar />
      <div className="flex-grow p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Organizer Dashboard
            </h1>
            <Link
              to="/organizer/events/create"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create New Event
            </Link>
          </div>
          <p className="text-gray-600 mt-2">
            Welcome back, {currentUser.name}!
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Events"
                value={dashboardData.stats.totalEvents}
                icon="📅"
                color="bg-blue-500"
              />
              <StatCard
                title="Tickets Sold"
                value={dashboardData.stats.totalTicketsSold}
                icon="🎟️"
                color="bg-green-500"
              />
              <StatCard
                title="Total Revenue"
                value={`$${dashboardData.stats.totalRevenue.toLocaleString()}`}
                icon="💰"
                color="bg-purple-500"
              />
              <StatCard
                title="Upcoming Events"
                value={dashboardData.stats.upcomingEvents}
                icon="🗓️"
                color="bg-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Revenue Overview
                </h2>
                <RevenueChart data={dashboardData.revenueData} />
              </div>

              {/* Action Center */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Action Center
                </h2>
                <ActionCenter />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Recent Events */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Recent Events
                  </h2>
                  <Link
                    to="/organizer/events"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                <EventsList events={dashboardData.recentEvents} type="recent" />
              </div>

              {/* Upcoming Events */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Upcoming Events
                  </h2>
                  <Link
                    to="/organizer/events"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                <EventsList
                  events={dashboardData.upcomingEvents}
                  type="upcoming"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
