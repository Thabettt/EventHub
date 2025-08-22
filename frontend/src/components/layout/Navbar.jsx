import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useDarkMode from "../../hooks/useDarkMode";

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useDarkMode();
  const isLanding = location.pathname === "/";

  // Close mobile menu and user dropdown when changing pages
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Helper to determine if a link is active
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Animated theme toggle (wired to useDarkMode)
  const ThemeToggle = () => (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setIsDark(!isDark)}
      className={`relative h-8 w-14 rounded-full transition-colors duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner overflow-hidden border ${
        isDark
          ? "bg-gradient-to-r from-gray-700 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-white to-gray-100 border-gray-200"
      }`}
    >
      {/* Icons row */}
      <span className="absolute inset-0 flex items-center justify-between px-2">
        {/* Sun */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 transition-all duration-300 ${
            isDark
              ? "text-white/70 opacity-40 scale-90"
              : "text-gray-700 opacity-100 scale-100"
          }`}
        >
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1.25a1 1 0 1 1 2 0V21a1 1 0 0 1-1 1Zm0-17.75a1 1 0 0 1-1-1V2.25a1 1 0 1 1 2 0V3.25a1 1 0 0 1-1 1Zm9 7.75a1 1 0 0 1-1 1h-1.25a1 1 0 1 1 0-2H20a1 1 0 0 1 1 1ZM6.25 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h1.25a1 1 0 0 1 1 1Zm11.657 6.657a1 1 0 0 1-1.414 0l-.884-.884a1 1 0 1 1 1.414-1.414l.884.884a1 1 0 0 1 0 1.414Zm-9.132-9.132a1 1 0 0 1-1.414 0l-.884-.884A1 1 0 1 1 7.797 6.343l.884.884a1 1 0 0 1 0 1.414Zm9.132-4.243a1 1 0 0 1 0 1.414l-.884.884a1 1 0 1 1-1.414-1.414l.884-.884a1 1 0 0 1 1.414 0Zm-9.132 9.132a1 1 0 0 1 0 1.414l-.884.884a1 1 0 0 1-1.414-1.414l.884-.884a1 1 0 0 1 1.414 0Z" />
        </svg>
        {/* Moon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 transition-all duration-300 ${
            isDark
              ? "text-white/90 opacity-100 scale-100"
              : "text-gray-500 opacity-40 scale-90"
          }`}
        >
          <path d="M21.752 15.002a9 9 0 1 1-12.754-12.75 1 1 0 0 1 1.3 1.3A7 7 0 1 0 20.45 13.7a1 1 0 0 1 1.302 1.302Z" />
        </svg>
      </span>
      {/* Knob */}
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 will-change-transform transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );

  return (
    <>
      <header
        className={`relative z-50 h-16 flex items-center transition-all duration-300 m-0 ${
          isLanding
            ? "bg-transparent"
            : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                {/* Main logo container */}
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center shadow-lg border border-indigo-500/20">
                  <span className="text-white font-black text-xl tracking-tight">
                    E
                  </span>
                  {/* Subtle inner highlight */}
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white/20 rounded-full blur-sm"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  Event
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Hub
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {["Events", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(`/${item.toLowerCase()}`)
                      ? "text-indigo-600 bg-indigo-50/70 dark:text-indigo-400 dark:bg-indigo-900/20"
                      : isLanding
                      ? "text-white hover:text-yellow-300 hover:bg-white/10"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800/60"
                  }`}
                >
                  {item}
                </Link>
              ))}

              {/* Theme toggle (desktop) */}
              <div className="ml-2 mr-1">
                <ThemeToggle />
              </div>

              {/* Auth section */}
              {currentUser ? (
                <div className="relative ml-4">
                  {/* User dropdown trigger */}
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isLanding
                        ? "hover:bg-white/10"
                        : "hover:bg-indigo-50/50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm border-2 border-indigo-200 dark:border-indigo-800/60">
                      {currentUser.name?.charAt(0) || "U"}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isLanding
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
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
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-gray-800">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50/60 dark:hover:bg-gray-800/70"
                      >
                        My Profile
                      </Link>

                      {currentUser.role === "Organizer" && (
                        <Link
                          to="/organizer/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50/60 dark:hover:bg-gray-800/70"
                        >
                          Dashboard
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50/60 dark:hover:bg-red-900/20"
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
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isLanding
                        ? "text-white hover:bg-white/10"
                        : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-gray-800/60"
                    }`}
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

            {/* Mobile actions: theme toggle + menu button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`rounded-md p-2 inline-flex items-center justify-center focus:outline-none ${
                  isLanding
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-gray-800/60"
                }`}
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
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {["Events", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(`/${item.toLowerCase()}`)
                      ? "text-indigo-600 bg-indigo-50/70 dark:text-indigo-400 dark:bg-indigo-900/20"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800/60"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>

            {currentUser ? (
              <div className="border-t border-gray-200/70 dark:border-gray-800 pt-4 pb-3">
                <div className="px-4 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                      {currentUser.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {currentUser.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-gray-800/60"
                  >
                    My Profile
                  </Link>

                  {currentUser.role === "Organizer" && (
                    <Link
                      to="/organizer/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-gray-800/60"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50/60 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200/70 dark:border-gray-800 p-4 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="w-full px-4 py-2 text-center text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-500 rounded-md hover:bg-indigo-50/50 dark:hover:bg-gray-800/60 transition-colors"
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
    </>
  );
};

export default Navbar;
