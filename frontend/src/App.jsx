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
import OrganizerSettingsPage from "./pages/organizer/OrganizerSettingsPage";

// import events pages
import EventsPage from "./pages/events/EventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";

import LandingPage from "./pages/LandingPage";

// Layout with navbar - no Outlet
const WithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-16">{children}</main>
    </>
  );
};

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Routes>
          {/* Landing page without navbar */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Events Routes - with navbar */}
          <Route
            path="/events"
            element={
              <WithNavbar>
                <EventsPage />
              </WithNavbar>
            }
          />
          <Route
            path="/events/:id"
            element={
              <WithNavbar>
                <EventDetailPage />
              </WithNavbar>
            }
          />

          {/* Auth Routes - with navbar */}
          <Route
            path="/register"
            element={
              <WithNavbar>
                <RegisterPage />
              </WithNavbar>
            }
          />
          <Route
            path="/login"
            element={
              <WithNavbar>
                <LoginPage />
              </WithNavbar>
            }
          />
          <Route
            path="/reset-password/:resetToken"
            element={
              <WithNavbar>
                <ResetPasswordPage />
              </WithNavbar>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <WithNavbar>
                <UnauthorizedPage />
              </WithNavbar>
            }
          />

          {/* Protected User Routes - with navbar */}
          <Route
            path="/profile"
            element={
              <WithNavbar>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </WithNavbar>
            }
          />

          {/* Organizer Routes - with navbar */}
          <Route
            path="/organizer/dashboard"
            element={
              <WithNavbar>
                <ProtectedRoute allowedRoles={["Organizer"]}>
                  <DashboardPage />
                </ProtectedRoute>
              </WithNavbar>
            }
          />

          {/* Add remaining organizer routes with the WithNavbar wrapper... */}

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <WithNavbar>
                <div className="container mx-auto px-4 py-16 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Page Not Found
                  </h2>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <Link
                    to="/"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Return to Home Page
                  </Link>
                </div>
              </WithNavbar>
            }
          />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-6 text-center">
            <p>© {new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
