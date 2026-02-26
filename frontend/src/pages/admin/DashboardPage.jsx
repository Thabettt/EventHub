import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { getAdminDashboard } from "../../services/adminService";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import {
  Users,
  CalendarHeart,
  Ticket,
  DollarSign,
  Zap,
  ShieldAlert,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Calendar,
  MapPin,
  ClipboardList,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// ── Vibrant Stat Card ────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  glowColor,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    whileHover={{ y: -6, scale: 1.03 }}
    className={`group relative ${gradient} rounded-3xl p-6 lg:p-7 text-white overflow-hidden shadow-2xl cursor-default`}
  >
    {/* ── Rich layered decorations ── */}
    {/* Large soft glow sphere */}
    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/[0.07] rounded-full blur-3xl" />
    {/* Bottom corner depth */}
    <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/15 rounded-full blur-2xl" />
    {/* Top-right corner highlight */}
    <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/[0.08] to-transparent" />
    {/* Corner ring decoration */}
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[3px] border-white/[0.08]" />
    <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full border-2 border-white/[0.05]" />
    {/* Dot pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    />
    {/* Animated shimmer sweep */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out" />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-5">
        {/* Icon with glowing ring */}
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-2xl blur-lg scale-[1.4] opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${glowColor || "bg-white/30"}`}
          />
          <div className="relative w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Icon
              className="w-7 h-7 text-white drop-shadow-sm"
              strokeWidth={1.8}
            />
          </div>
        </div>
        {sub && (
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
            <div className="text-[11px] font-bold opacity-95 tracking-wide">
              {sub}
            </div>
          </div>
        )}
      </div>
      <div className="text-3xl lg:text-[2.5rem] font-black mb-1 drop-shadow-md tracking-tight leading-none">
        {value}
      </div>
      <div className="text-white/60 font-semibold text-[13px] uppercase tracking-widest mt-2">
        {label}
      </div>
      {/* Bottom accent bar */}
      <div className="mt-4 h-1 w-14 bg-white/15 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  </motion.div>
);

// ── Quick Action Link ────────────────────────────────────────────────────────
const ActionLink = ({
  to,
  icon: Icon,
  title,
  subtitle,
  gradient,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -14 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ x: 4 }}
  >
    <Link
      to={to}
      className="group relative flex items-center gap-4 w-full bg-white/80 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-5 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl dark:hover:shadow-indigo-500/10 overflow-hidden"
    >
      {/* Left gradient bar — reveals on hover */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${gradient} rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      {/* Subtle glow bleed behind icon */}
      <div
        className={`absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 ${gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`}
      />

      <div className="relative">
        <div
          className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 flex items-center justify-center transition-all duration-300 flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  </motion.div>
);

// ── Event Row ────────────────────────────────────────────────────────────────
const EventRow = ({ event, delay = 0 }) => {
  const sold =
    event.totalTickets -
    (event.availableTickets || event.remainingTickets || 0);
  const pct = event.totalTickets ? (sold / event.totalTickets) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3, scale: 1.005 }}
      className="group relative bg-white/90 dark:bg-[#16161c] hover:bg-white dark:hover:bg-[#1c1c24] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl dark:hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* Top gradient stripe — intensifies on hover */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              {/* Live status dot */}
              <div className="relative flex-shrink-0">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-30" />
              </div>
              <Link
                to={`/admin/events/${event._id}`}
                className="text-base lg:text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
              >
                {event.title}
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 ml-5 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate max-w-[180px] text-gray-700 dark:text-gray-300">
                  {event.location}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20">
              {event.category || "General"}
            </span>
            <span className="text-lg font-black text-gray-900 dark:text-white">
              <span className="text-emerald-500">$</span>
              {event.ticketPrice?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Ticket progress — enhanced */}
        {event.totalTickets > 0 && (
          <div className="pt-3 mt-1 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500 dark:text-gray-500 font-semibold uppercase tracking-wider">
                Tickets sold
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-700 dark:text-gray-300">
                  {sold}
                  <span className="text-gray-400 dark:text-gray-500 font-medium">
                    /{event.totalTickets}
                  </span>
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                  {Math.round(pct)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  delay: delay + 0.2,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const { currentUser, token } = useAuth();
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
        const data = await getAdminDashboard(token);
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
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response) {
          setError(
            `Server error (${err.response.status}): ${
              err.response.data?.message || "Unknown error"
            }`,
          );
        } else if (err.request) {
          setError("Network error: Unable to connect to server.");
        } else {
          setError(`Error: ${err.message}`);
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

  // ── Access Denied ──────────────────────────────────────────────────────────
  if (!currentUser || currentUser.role !== "System Admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-10 shadow-xl dark:shadow-none max-w-md text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You must be logged in as a system administrator to access this page.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0F0F13] text-gray-900 dark:text-gray-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      {/* ═══ Breathing Spheres Background ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 -right-10 w-[55%] h-[55%] rounded-full bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 blur-[100px]"
            animate={{
              x: [0, 20, 0],
              y: [0, 15, 0],
              scale: [1, 1.05, 0.98, 1],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-indigo-600/20 blur-[100px]"
            animate={{
              x: [0, -20, 0],
              y: [0, -15, 0],
              scale: [1, 1.08, 0.95, 1],
              rotate: [0, -2, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* Floating particles (dark mode) */}
          <div className="absolute inset-0 opacity-0 dark:opacity-20">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-indigo-400"
                style={{
                  width: Math.random() * 3 + 1 + "px",
                  height: Math.random() * 3 + 1 + "px",
                  top: Math.random() * 100 + "%",
                  left: Math.random() * 100 + "%",
                }}
                animate={{ y: [0, -100], opacity: [0, 0.8, 0] }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="relative z-10 container mx-auto px-4 py-10 lg:py-16 max-w-7xl">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">
              Administration
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
            Welcome back, {currentUser?.name || "Administrator"} •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" color="indigo" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Dashboard Error
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Dashboard Load
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── KPI Grid — Vibrant gradient cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
              <StatCard
                icon={Users}
                label="Total Users"
                value={dashboardData.stats.totalUsers.toLocaleString()}
                sub={`${dashboardData.stats.totalOrganizers} organizers`}
                gradient="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                glowColor="bg-blue-400/50"
                delay={0}
              />
              <StatCard
                icon={CalendarHeart}
                label="Total Events"
                value={dashboardData.stats.totalEvents}
                sub={
                  dashboardData.stats.pendingEvents > 0
                    ? `${dashboardData.stats.pendingEvents} pending`
                    : undefined
                }
                gradient="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
                glowColor="bg-emerald-400/50"
                delay={0.07}
              />
              <StatCard
                icon={Ticket}
                label="Total Bookings"
                value={dashboardData.stats.totalBookings.toLocaleString()}
                gradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"
                glowColor="bg-orange-400/50"
                delay={0.14}
              />
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={`$${dashboardData.stats.totalRevenue.toLocaleString()}`}
                gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500"
                glowColor="bg-violet-400/50"
                delay={0.21}
              />
            </div>

            {/* ── Main Grid: Events + Sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Recent Events — 8 cols */}
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        Recent Events
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                        Latest events on the platform
                      </p>
                    </div>
                    <Link
                      to="/admin/events"
                      className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                      View All Events
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {dashboardData.recentEvents.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentEvents.map((event, idx) => (
                        <EventRow
                          key={event._id}
                          event={event}
                          delay={0.3 + idx * 0.06}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-300 dark:border-white/5"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        No Recent Events
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Events will appear here as they are created
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar — 4 cols */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        Executive Actions
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">
                        Strategic management tools
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <ActionLink
                      to="/admin/users"
                      icon={Users}
                      title="User Management"
                      subtitle="Manage platform users"
                      gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                      delay={0.35}
                    />
                    <ActionLink
                      to="/admin/events"
                      icon={CalendarHeart}
                      title="Event Approval"
                      subtitle="Review pending events"
                      gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                      delay={0.4}
                    />
                    <ActionLink
                      to="/admin/bookings"
                      icon={Ticket}
                      title="Manage Bookings"
                      subtitle="Oversee reservations"
                      gradient="bg-gradient-to-r from-orange-500 to-red-600"
                      delay={0.45}
                    />
                    <ActionLink
                      to="/admin/analytics"
                      icon={BarChart3}
                      title="Platform Analytics"
                      subtitle="Deep business insights"
                      gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                      delay={0.5}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
