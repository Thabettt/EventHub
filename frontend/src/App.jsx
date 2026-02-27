import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import React, { Suspense, lazy } from "react";
import Navbar from "./components/layout/Navbar";

const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("./pages/user/ProfilePage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const UnauthorizedPage = lazy(() => import("./pages/auth/UnauthorizedPage"));
const TicketsPage = lazy(() => import("./pages/user/TicketsPage"));
const BookingSuccessPage = lazy(
  () => import("./pages/bookings/BookingSuccessPage"),
);

// Lazy load organizer pages
const DashboardPage = lazy(() => import("./pages/organizer/DashboardPage"));
const EventsListPage = lazy(() => import("./pages/organizer/EventsListPage"));
const CreateEventPage = lazy(() => import("./pages/organizer/CreateEventPage"));
const OrganizerEventDetailPage = lazy(
  () => import("./pages/organizer/EventDetailsPage"),
);
const EditEventPage = lazy(() => import("./pages/organizer/EditEventPage"));
const AnalyticsPage = lazy(() => import("./pages/organizer/AnalyticsPage"));
const AttendeesPage = lazy(() => import("./pages/organizer/AttendeesPage"));
const AttendeeDetailPage = lazy(
  () => import("./pages/organizer/AttendeeDetailPage"),
);
const OrganizerSettingsPage = lazy(
  () => import("./pages/organizer/OrganizerSettingsPage"),
);

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const EventApprovalPage = lazy(() => import("./pages/admin/EventApprovalPage"));
const UserManagementPage = lazy(
  () => import("./pages/admin/UserManagementPage"),
);

// Lazy load events pages
const EventsPage = lazy(() => import("./pages/events/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/events/EventDetailPage"));

const HomePage = lazy(() => import("./pages/HomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Protected route component with role-based access control
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }

  // Check for role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const contextClass = {
  success: "bg-white/90 dark:bg-gray-800/90 text-green-600 dark:text-green-400",
  error: "bg-white/90 dark:bg-gray-800/90 text-red-600 dark:text-red-400",
  info: "bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400",
  warning:
    "bg-white/90 dark:bg-gray-800/90 text-yellow-600 dark:text-yellow-400",
  default: "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400",
};

function App() {
  const { currentUser, loading } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-inherit text-inherit transition-colors">
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName={({ type }) =>
            contextClass[type || "default"] +
            " relative flex p-1 min-h-10 rounded-xl justify-between overflow-hidden cursor-pointer shadow-xl backdrop-blur-md border border-white/20 dark:border-gray-700/50 mb-4 transform transition-all hover:scale-[1.02]"
          }
          bodyClassName={() => "text-sm font-medium p-3 flex items-center"}
        />
        <Navbar />
        <main className="flex-grow bg-inherit text-inherit transition-colors">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }
          >
            <Routes>
              {/* Home/Landing Route */}
              <Route
                path="/"
                element={
                  loading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : currentUser ? (
                    <HomePage />
                  ) : (
                    <LandingPage />
                  )
                }
              />

              {/* Public Events Routes */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Auth Routes */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/reset-password/:resetToken"
                element={<ResetPasswordPage />}
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <TicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-success"
                element={
                  <ProtectedRoute>
                    <BookingSuccessPage />
                  </ProtectedRoute>
                }
              />

              {/* Organizer Routes */}
              <Route
                path="/organizer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/events"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <EventsListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/events/create"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/events/:id"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <OrganizerEventDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/events/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/analytics"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/attendees"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <AttendeesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/attendees/:id"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <AttendeeDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizer/settings"
                element={
                  <ProtectedRoute allowedRoles={["Organizer"]}>
                    <OrganizerSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["System Admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id"
                element={
                  <ProtectedRoute allowedRoles={["System Admin"]}>
                    <EventApprovalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["System Admin"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors">
                      Page Not Found
                    </h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400 transition-colors">
                      The page you're looking for doesn't exist.
                    </p>
                    <Link
                      to="/"
                      className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Return to Home Page
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
