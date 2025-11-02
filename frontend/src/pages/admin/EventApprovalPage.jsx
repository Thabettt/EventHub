import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import Button from "../../components/common/Button";
import { getEventById } from "../../services/eventService";
import { approveEvent, rejectEvent } from "../../services/adminService";

const EventApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const eventData = await getEventById(id);
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approveEvent(id, token);
      setActionType("approved");
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error approving event:", error);
      setError("Failed to approve event. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await rejectEvent(id, token);
      setActionType("rejected");
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error rejecting event:", error);
      setError("Failed to reject event. Please try again.");
      setIsProcessing(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center animate-scale-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Event {actionType === "approved" ? "Approved" : "Rejected"}!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Mobile View */}
      {(deviceInfo.isMobile || deviceInfo.isTablet) && (
        <div className="relative z-10">
          {/* Mobile Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-3 py-3 sticky top-0 z-40">
            <div className="flex items-center space-x-3">
              <Button
                variant="back"
                onClick={() => navigate("/admin/dashboard")}
                className="!bg-gray-100 dark:!bg-white/10 !text-gray-900 dark:!text-white"
              />
              <div>
                <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Event Review
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  Review event details and approve or reject
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 px-3">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Loading Event Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-md">
                Please wait while we fetch the event information...
              </p>
            </div>
          ) : error ? (
            <div className="px-3 pt-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 p-6 rounded-3xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-bold text-lg">
                      Error Loading Event
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </p>
                  </div>
                </div>
                <Button
                  variant="back"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          ) : event ? (
            <div className="px-3 py-6 space-y-6">
              {/* Event Status Badge */}
              <div className="flex justify-center">
                <div
                  className={`inline-flex items-center px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg ${
                    event.status === "approved"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : event.status === "rejected"
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  }`}
                >
                  {event.status === "pending" && "⏳ Pending Review"}
                  {event.status === "approved" && "✓ Approved"}
                  {event.status === "rejected" && "✗ Rejected"}
                </div>
              </div>

              {/* Event Image */}
              {event.image ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-56 object-cover rounded-2xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl p-4 shadow-xl border border-indigo-200/50 dark:border-indigo-700/50 h-56 flex items-center justify-center">
                    <span className="text-7xl">🎉</span>
                  </div>
                </div>
              )}

              {/* Event Details Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                        {event.title}
                      </h2>
                      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200/50 dark:border-indigo-700/50">
                        <span className="text-indigo-800 dark:text-indigo-200 font-bold text-sm">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Description */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">📝</span>
                        <div className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white leading-relaxed text-sm">
                        {event.description}
                      </p>
                    </div>

                    {/* Date & Location Grid */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">📅</span>
                          <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Date & Time
                          </div>
                        </div>
                        <div className="text-gray-900 dark:text-white font-black text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">📍</span>
                          <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Location
                          </div>
                        </div>
                        <div className="text-gray-900 dark:text-white font-black text-sm">
                          {event.location}
                        </div>
                      </div>
                    </div>

                    {/* Ticket Information Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
                          Price
                        </div>
                        <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                          ${event.ticketPrice}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
                          Total
                        </div>
                        <div className="text-2xl font-black text-blue-900 dark:text-blue-100">
                          {event.totalTickets}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                        <div className="text-xs font-black text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">
                          Left
                        </div>
                        <div className="text-2xl font-black text-orange-900 dark:text-orange-100">
                          {event.remainingTickets}
                        </div>
                      </div>
                    </div>

                    {/* Availability Progress */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-violet-200/50 dark:border-violet-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          Ticket Availability
                        </div>
                        <div className="text-sm font-black text-violet-900 dark:text-violet-100">
                          {(
                            (event.remainingTickets / event.totalTickets) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-violet-200 dark:bg-violet-900/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (event.remainingTickets / event.totalTickets) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Information Card */}
              {event.organizer && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          Event Organizer
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                          {event.organizer.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Email */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="text-lg">📧</span>
                          <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Email
                          </div>
                        </div>
                        <div className="text-gray-900 dark:text-white font-bold break-all text-sm">
                          {event.organizer.email}
                        </div>
                      </div>

                      {/* Phone Number */}
                      {event.organizer.phoneNumber && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <span className="text-lg">📱</span>
                            <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                              Phone
                            </div>
                          </div>
                          <div className="text-gray-900 dark:text-white font-bold text-sm">
                            {event.organizer.phoneNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {event.status === "pending" && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="danger"
                    size="default"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="w-full !py-3.5 !text-sm !font-black"
                  >
                    {isProcessing && actionType === "rejected"
                      ? "Rejecting..."
                      : "✗ Reject"}
                  </Button>
                  <Button
                    variant="success"
                    size="default"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full !py-3.5 !text-sm !font-black"
                  >
                    {isProcessing && actionType === "approved"
                      ? "Approving..."
                      : "✓ Approve"}
                  </Button>
                </div>
              )}

              {event.status !== "pending" && (
                <Button
                  variant="back"
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full !py-3.5"
                >
                  Back to Dashboard
                </Button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Desktop View */}
      {deviceInfo.isDesktop && (
        <div className="min-h-screen relative z-10">
          <div className="flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="back"
                    onClick={() => navigate("/admin/dashboard")}
                    className="!bg-gray-100 dark:!bg-white/10 !text-gray-900 dark:!text-white"
                  />
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Event Review
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      Review event details and make a decision
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {event && (
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                      event.status === "approved"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : event.status === "rejected"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {event.status === "pending" && "⏳ Pending Review"}
                    {event.status === "approved" && "✓ Approved"}
                    {event.status === "rejected" && "✗ Rejected"}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Loading Event Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Please wait while we fetch the event information...
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
                          Error Loading Event
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="back"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              ) : event ? (
                <div className="w-full max-w-7xl mx-auto px-8">
                  <div className="grid grid-cols-12 gap-8">
                    {/* Left Column - Event Image & Quick Actions */}
                    <div className="col-span-5">
                      {/* Image Card with Shadow Effect */}
                      <div className="relative group mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-80 object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="w-full h-80 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                              <span className="text-8xl">🎉</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats Cards */}
                      <div className="relative group sticky top-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6">
                          {/* Ticket Price - Featured */}
                          <div className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl"></div>
                            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-2xl text-white shadow-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                  <span className="text-2xl">💰</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-bold opacity-90 uppercase tracking-wider">
                                    Revenue Potential
                                  </div>
                                  <div className="text-sm opacity-75">
                                    $
                                    {(
                                      event.ticketPrice * event.totalTickets
                                    ).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-bold text-emerald-100 mb-1 uppercase tracking-wider">
                                Ticket Price
                              </div>
                              <div className="text-4xl font-black">
                                ${event.ticketPrice}
                              </div>
                            </div>
                          </div>

                          {/* Ticket Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                              <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
                                Total Tickets
                              </div>
                              <div className="text-3xl font-black text-blue-900 dark:text-blue-100">
                                {event.totalTickets.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                              <div className="text-xs font-black text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">
                                Available
                              </div>
                              <div className="text-3xl font-black text-orange-900 dark:text-orange-100">
                                {event.remainingTickets.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Availability Progress */}
                          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-violet-200/50 dark:border-violet-700/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Availability
                              </div>
                              <div className="text-lg font-black text-violet-900 dark:text-violet-100">
                                {(
                                  (event.remainingTickets /
                                    event.totalTickets) *
                                  100
                                ).toFixed(0)}
                                %
                              </div>
                            </div>
                            <div className="w-full h-2.5 bg-violet-200 dark:bg-violet-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (event.remainingTickets /
                                      event.totalTickets) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {event.status === "pending" && (
                            <div className="space-y-4 pt-2">
                              <Button
                                variant="outline"
                                size="default"
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="w-full !py-4 !text-base !font-black"
                              >
                                {isProcessing && actionType === "approved"
                                  ? "Approving..."
                                  : "✓ Approve Event"}
                              </Button>
                              <Button
                                variant="blank"
                                size="default"
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="w-full !py-4 !text-base !font-black"
                              >
                                {isProcessing && actionType === "rejected"
                                  ? "Rejecting..."
                                  : "✗ Reject Event"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Event Details */}
                    <div className="col-span-7">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                          {/* Header Section */}
                          <div className="flex items-start space-x-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-3xl">✨</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                                {event.title}
                              </h2>
                              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm">
                                <span className="text-indigo-800 dark:text-indigo-200 font-black text-base">
                                  {event.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Description */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                                  <span className="text-2xl">📋</span>
                                </div>
                                <div className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Event Description
                                </div>
                              </div>
                              <p className="text-gray-900 dark:text-white leading-relaxed text-lg">
                                {event.description}
                              </p>
                            </div>

                            {/* Date & Time */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                                  <span className="text-2xl">📅</span>
                                </div>
                                <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                  Date & Time
                                </div>
                              </div>
                              <div className="text-gray-900 dark:text-white font-black text-2xl mb-2">
                                {new Date(event.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                              <div className="text-blue-700 dark:text-blue-300 text-base font-bold">
                                {new Date(event.date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>

                            {/* Location */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                                  <span className="text-2xl">📍</span>
                                </div>
                                <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                  Event Location
                                </div>
                              </div>
                              <div className="text-gray-900 dark:text-white font-black text-2xl">
                                {event.location}
                              </div>
                            </div>

                            {/* Organizer Information */}
                            {event.organizer && (
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                  </div>
                                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    Event Organizer
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                      Name
                                    </div>
                                    <div className="text-gray-900 dark:text-white font-black text-xl">
                                      {event.organizer.name}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                      Email
                                    </div>
                                    <div className="text-gray-900 dark:text-white font-bold break-all">
                                      {event.organizer.email}
                                    </div>
                                  </div>
                                  {event.organizer.phoneNumber && (
                                    <div>
                                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                        Phone
                                      </div>
                                      <div className="text-gray-900 dark:text-white font-bold">
                                        {event.organizer.phoneNumber}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApprovalPage;
