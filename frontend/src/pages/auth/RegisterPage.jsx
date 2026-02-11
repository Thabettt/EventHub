import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

// Custom CSS to handle autofill dark mode
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus,
  select:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
  }
  
  .dark input:-webkit-autofill,
  .dark input:-webkit-autofill:hover,
  .dark input:-webkit-autofill:focus,
  .dark input:-webkit-autofill:active,
  .dark select:-webkit-autofill,
  .dark select:-webkit-autofill:hover,
  .dark select:-webkit-autofill:focus,
  .dark select:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #374151 inset !important;
    -webkit-text-fill-color: #f9fafb !important;
  }
`;

// SVG icon components
const ErrorIcon = () => (
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
);

const CheckIcon = () => (
  <svg
    className="h-5 w-5 text-green-500"
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
);

// Progress steps indicator - updated to remove pulsing animation
const ProgressSteps = ({ currentStep, totalSteps }) => (
  <div className="flex justify-center mb-6 max-w-xs mx-auto">
    {[...Array(totalSteps)].map((_, index) => (
      <div key={index} className="flex items-center">
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
            index < currentStep
              ? "bg-indigo-600 text-white"
              : index === currentStep
                ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600"
                : "bg-gray-200 text-gray-600"
          }`}
          initial={{ scale: index === currentStep ? 0.5 : 1 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 1.0,
            ease: "easeOut",
          }}
        >
          {index < currentStep ? "✓" : index + 1}
        </motion.div>
        {index < totalSteps - 1 && (
          <div className="w-16 h-0.5 mx-2 bg-gray-200">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: index < currentStep ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Animation variants
  const pageTransition = {
    in: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
    out: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  // Auto focus on first input when step changes
  useEffect(() => {
    const focusMap = ["name", "email", "password"];
    const timer = setTimeout(() => {
      const input = document.getElementById(focusMap[step] || "name");
      if (input) input.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [step]);

  // Password strength calculation
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[a-z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(Math.min(strength, 4));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = "Name is required";
        } else if (formData.name.length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        }
        break;

      case 1:
        if (!formData.email) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
        break;

      case 2:
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authService.register(registrationData);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (!formData.password) return "";
    const labels = ["Very weak", "Weak", "Medium", "Strong", "Very strong"];
    return labels[passwordStrength];
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password) return "bg-gray-200";
    const colors = [
      "bg-red-500", // Very weak
      "bg-orange-500", // Weak
      "bg-yellow-500", // Medium
      "bg-lime-500", // Strong
      "bg-green-500", // Very strong
    ];
    return colors[passwordStrength];
  };

  return (
    <>
      {/* Autofill styles */}
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />

      <div className="fixed inset-0 h-full w-full overflow-hidden">
        {/* Enhanced animated background */}
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900">
          <div className="absolute inset-0">
            {/* Main flowing gradient blob */}
            <motion.div
              className="absolute top-0 -right-10 w-[55%] h-[55%] rounded-full bg-gradient-to-r from-blue-200 via-indigo-200 to-indigo-300 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 opacity-70 blur-3xl"
              animate={{
                x: [0, 20, 0],
                y: [0, 15, 0],
                scale: [1, 1.05, 0.98, 1],
                opacity: [0.5, 0.65, 0.55, 0.5],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1],
              }}
            />

            {/* Secondary flowing gradient blob */}
            <motion.div
              className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:from-purple-500 dark:via-pink-500 dark:to-blue-500 opacity-70 blur-3xl"
              animate={{
                x: [0, -20, 0],
                y: [0, -15, 0],
                scale: [1, 1.08, 0.95, 1],
                opacity: [0.5, 0.7, 0.6, 0.5],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                times: [0, 0.4, 0.7, 1],
              }}
            />

            {/* Smaller accent gradient blob */}
            <motion.div
              className="absolute top-1/3 left-1/4 w-[30%] h-[30%] rounded-full bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100 dark:from-indigo-500 dark:via-teal-500 dark:to-purple-500 opacity-50 blur-3xl"
              animate={{
                x: [0, 40, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 0.9, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />

            {/* Floating particle effects */}
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

        {/* Content container */}
        <div className="relative min-h-screen overflow-auto flex flex-col justify-center z-10 px-4">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Brand logo */}
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
              Create your account
            </motion.h2>

            <motion.p
              className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Get started with your EventHub experience
            </motion.p>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <motion.div
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 dark:border-gray-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Progress steps */}
              <ProgressSteps currentStep={step} totalSteps={3} />

              {/* Error message */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    className="mb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ErrorIcon />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{apiError}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                className="space-y-5"
                onSubmit={(e) =>
                  step < 2 ? e.preventDefault() : handleSubmit(e)
                }
              >
                <AnimatePresence mode="wait">
                  {/* Step 1: Name */}
                  {step === 0 && (
                    <motion.div
                      key="step1"
                      initial="out"
                      animate="in"
                      exit="out"
                      variants={pageTransition}
                      className="space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2.5 pl-10 border ${
                              errors.name
                                ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Email */}
                  {step === 1 && (
                    <motion.div
                      key="step2"
                      initial="out"
                      animate="in"
                      exit="out"
                      variants={pageTransition}
                      className="space-y-5"
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
                            value={formData.email}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2.5 pl-10 border ${
                              errors.email
                                ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Password and Role */}
                  {step === 2 && (
                    <motion.div
                      key="step3"
                      initial="out"
                      animate="in"
                      exit="out"
                      variants={pageTransition}
                      className="space-y-5"
                    >
                      {/* Password field */}
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2.5 pl-10 border ${
                              errors.password
                                ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                          >
                            {errors.password}
                          </motion.p>
                        )}

                        {/* Password strength meter */}
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${getPasswordStrengthColor()}`}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(passwordStrength + 1) * 20}%`,
                                  }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <span className="ml-2 text-xs text-gray-500 min-w-[70px] text-right">
                                {getPasswordStrengthLabel()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Use 8+ characters with a mix of letters, numbers &
                              symbols
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm password field */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2.5 pl-10 border ${
                              errors.confirmPassword
                                ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                          {formData.confirmPassword &&
                            formData.password === formData.confirmPassword && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <CheckIcon />
                              </div>
                            )}
                        </div>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={step === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      step === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    }`}
                  >
                    Previous
                  </button>

                  {step < 2 ? (
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Next
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
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
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>

          <motion.p
            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
