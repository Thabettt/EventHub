import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as authService from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

// Custom CSS to handle autofill dark mode
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
  }
  
  .dark input:-webkit-autofill,
  .dark input:-webkit-autofill:hover,
  .dark input:-webkit-autofill:focus,
  .dark input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #374151 inset !important;
    -webkit-text-fill-color: #f9fafb !important;
  }
`;

// SVG icons component for cleaner JSX
const Icons = {
  Success: () => (
    <svg
      className="h-5 w-5 text-green-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Error: () => (
    <svg
      className="h-5 w-5 text-red-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Focus effect for form switching
  useEffect(() => {
    const timer = setTimeout(() => {
      const inputToFocus = showForgotPassword
        ? document.getElementById("forgotEmail")
        : document.getElementById("email");
      if (inputToFocus) inputToFocus.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [showForgotPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleForgotEmailChange = (e) => {
    setForgotEmail(e.target.value);
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await auth.login(formData.email, formData.password, rememberMe);
      navigate(location.state?.from || "/");
    } catch (err) {
      console.error("Login error details:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(forgotEmail);
      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to process password reset request.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError("");
    setSuccessMessage("");
  };

  // Animation variants
  const pageTransition = {
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
    out: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      {/* Autofill styles */}
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />

      <div className="fixed inset-0 h-full w-full overflow-hidden">
        {/* Enhanced animated background with multiple layers */}
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900">
          <div className="absolute inset-0">
            {/* Main gradient blob - flowing motion */}
            <motion.div
              className="absolute top-0 -left-10 w-[50%] h-[55%] rounded-full bg-gradient-to-r from-indigo-200 via-blue-200 to-indigo-300 dark:from-purple-500 dark:via-indigo-500 dark:to-purple-600 opacity-70 blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, 20, 0],
                scale: [1, 1.06, 0.98, 1],
                opacity: [0.5, 0.6, 0.5],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.4, 0.7, 1],
              }}
            />

            {/* Secondary flowing blob */}
            <motion.div
              className="absolute bottom-0 right-0 w-[60%] h-[65%] rounded-full bg-gradient-to-r from-purple-200 via-indigo-200 to-blue-200 dark:from-purple-600 dark:via-pink-500 dark:to-indigo-600 opacity-70 blur-3xl"
              animate={{
                x: [0, -25, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 0.95, 1],
                opacity: [0.5, 0.7, 0.6, 0.5],
                rotate: [0, -3, 0],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.35, 0.7, 1],
              }}
            />

            {/* Small accent blob for added depth */}
            <motion.div
              className="absolute top-2/3 right-1/3 w-[35%] h-[35%] rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 opacity-40 blur-3xl"
              animate={{
                x: [0, -30, 0],
                y: [0, 25, 0],
                scale: [1, 1.2, 0.9, 1],
                opacity: [0.3, 0.45, 0.3],
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />

            {/* Subtle particle effect in background */}
            <div className="absolute inset-0 opacity-30 dark:opacity-80">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white dark:bg-purple-600"
                  style={{
                    width: Math.random() * 4 + 2 + "px",
                    height: Math.random() * 4 + 2 + "px",
                    top: Math.random() * 100 + "%",
                    left: Math.random() * 100 + "%",
                  }}
                  animate={{
                    y: [0, -(Math.random() * 100 + 50)],
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content container with scroll capability */}
        <div className="relative min-h-screen overflow-auto flex flex-col justify-center z-10 px-4">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Brand Logo */}
            <motion.div
              className="mx-auto w-12 h-12 mb-8 bg-indigo-600 rounded-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-8 h-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </motion.div>

            <motion.h2
              className="text-center text-2xl font-medium text-gray-900 dark:text-gray-100 mb-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Sign in to EventHub
            </motion.h2>
            <motion.p
              className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {showForgotPassword
                ? "We'll send you instructions to reset your password"
                : "Enter your details to access your account"}
            </motion.p>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <motion.div
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 dark:border-gray-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Message alerts */}
              <AnimatePresence mode="wait">
                {(location.state?.message || successMessage) && !error && (
                  <motion.div
                    key="success"
                    className="mb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md border-l-4 border-green-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Icons.Success />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-800">
                            {successMessage || location.state?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error"
                    className="mb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Icons.Error />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800 dark:text-red-300">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form content with animations */}
              <AnimatePresence mode="wait">
                {showForgotPassword ? (
                  <motion.form
                    key="forgotForm"
                    className="space-y-5"
                    onSubmit={handleForgotPassword}
                    initial="out"
                    animate="in"
                    exit="out"
                    variants={pageTransition}
                  >
                    <div>
                      <label
                        htmlFor="forgotEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <input
                          id="forgotEmail"
                          name="forgotEmail"
                          type="email"
                          autoComplete="email"
                          required
                          value={forgotEmail}
                          onChange={handleForgotEmailChange}
                          className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 autofill:bg-white dark:autofill:bg-gray-700 autofill:text-gray-900 dark:autofill:text-gray-100"
                          placeholder="you@example.com"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Send reset instructions"
                        )}
                      </motion.button>
                    </div>

                    <div className="text-sm text-center mt-6">
                      <motion.button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Return to login
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="loginForm"
                    className="space-y-5"
                    onSubmit={handleSubmit}
                    initial="out"
                    animate="in"
                    exit="out"
                    variants={pageTransition}
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 autofill:bg-white dark:autofill:bg-gray-700 autofill:text-gray-900 dark:autofill:text-gray-100"
                          placeholder="you@example.com"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </label>
                        <div className="text-sm">
                          <motion.button
                            type="button"
                            onClick={toggleForgotPassword}
                            className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            Forgot?
                          </motion.button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 autofill:bg-white dark:autofill:bg-gray-700 autofill:text-gray-900 dark:autofill:text-gray-100"
                          placeholder="••••••••"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200 dark:bg-gray-700"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Remember me for 30 days
                      </label>
                    </div>

                    <div>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          "Sign in"
                        )}
                      </motion.button>
                    </div>

                    {/* Social login options */}
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <svg
                            className="w-5 h-5 text-[#4285F4]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        </motion.button>

                        <motion.button
                          type="button"
                          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <svg
                            className="w-5 h-5 text-black"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              d="M13.5 1C14.0636 1 14.5965 1.17293 15 1.5C16.5228 2.91895 16.7727 4.45114 16.5 6.5C18 7.0863 19 8.29346 19 10V10.5C19 12.5 19.5 13.5 20 14C20.1811 14.1811 20.5 14.5 20.5 15C20.5 15.5 20 16 19.5 16H13.5V16.5C13.5 16.7761 13.7239 17 14 17H14.5C14.7761 17 15 17.2239 15 17.5C15 17.7761 14.7761 18 14.5 18H9.5C9.22386 18 9 17.7761 9 17.5C9 17.2239 9.22386 17 9.5 17H10C10.2761 17 10.5 16.7761 10.5 16.5V16H4.5C4 16 3.5 15.5 3.5 15C3.5 14.5 3.81893 14.1811 4 14C4.5 13.5 5 12.5 5 10.5V10C5 8.29346 6 7.0863 7.5 6.5C7.22727 4.45114 7.47716 2.91895 9 1.5C9.40345 1.17293 9.93644 1 10.5 1H13.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.p
            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {showForgotPassword ? (
              <span>
                Remember your password?{" "}
                <motion.button
                  onClick={toggleForgotPassword}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back to sign in
                </motion.button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors duration-200"
                >
                  Sign up
                </Link>
              </span>
            )}
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
