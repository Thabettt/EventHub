import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle navbar appearance on scroll with debounce for smoother transitions
  useEffect(() => {
    let debounceTimer;
    const handleScroll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setScrolled(window.scrollY > 20);
      }, 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, []);

  // Close mobile menu when changing pages
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Helper function to determine if a link is active
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center backdrop-blur-md transition-all duration-300 ${
        scrolled ? "bg-black/10 shadow-sm" : "bg-transparent"
      } ${location.pathname === "/" ? "pointer-events-auto" : ""}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo remains unchanged */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {["Events", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(`/${item.toLowerCase()}`)
                    ? "text-indigo-600 bg-indigo-50/70"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50"
                }`}
              >
                {item}
              </Link>
            ))}

            {/* Conditional renders based on auth state */}
            {currentUser ? (
              <div className="relative ml-4">
                {/* User dropdown trigger */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm border-2 border-indigo-200">
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.name?.split(" ")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/60"
                    >
                      My Profile
                    </Link>

                    {currentUser.role === "Organizer" && (
                      <Link
                        to="/organizer/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/60"
                      >
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50/60"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600/90 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["Events", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(`/${item.toLowerCase()}`)
                    ? "text-indigo-600 bg-indigo-50/70"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {currentUser ? (
            <div className="border-t border-gray-200/70 pt-4 pb-3">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {currentUser.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50"
                >
                  My Profile
                </Link>

                {currentUser.role === "Organizer" && (
                  <Link
                    to="/organizer/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50/60"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200/70 p-4 flex flex-col space-y-2">
              <Link
                to="/login"
                className="w-full px-4 py-2 text-center text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50/50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full px-4 py-2 text-center text-white bg-indigo-600/90 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
