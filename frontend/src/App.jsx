import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/user/ProfilePage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Import Navbar component
import Navbar from "./components/layout/Navbar";

// Import organizer pages
import DashboardPage from "./pages/organizer/DashboardPage";
import EventsListPage from "./pages/organizer/EventsListPage";
import CreateEventPage from "./pages/organizer/CreateEventPage";
import OrganizerEventDetailPage from "./pages/organizer/EventDetailsPage";
import EditEventPage from "./pages/organizer/EditEventPage";
import AnalyticsPage from "./pages/organizer/AnalyticsPage";
import AttendeesPage from "./pages/organizer/AttendeesPage";
import AttendeeDetailPage from "./pages/organizer/AttendeeDetailPage";
import OrganizerSettingsPage from "./pages/organizer/OrganizerSettingsPage";

// Import admin pages
import AdminDashboardPage from "./pages/admin/DashboardPage";
import EventApprovalPage from "./pages/admin/EventApprovalPage";

// import events pages
import EventsPage from "./pages/events/EventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";

import LandingPage from "./pages/LandingPage";

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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-inherit text-inherit transition-colors">
        <Navbar />
        <main className="flex-grow bg-inherit text-inherit transition-colors">
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

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
        </main>
      </div>
    </Router>
  );
}

export default App;
