import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LoadingSpinner - A versatile, animated loading component with dark mode support
 * 
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color theme: 'indigo', 'purple', 'blue', 'white'
 * @param {string} variant - Display variant: 'inline', 'fullScreen', 'page'
 * @param {string} message - Optional loading message to display
 * @param {string} subMessage - Optional secondary message
 * @param {boolean} show - Control visibility (for AnimatePresence)
 */
const LoadingSpinner = ({
  size = "md",
  color = "indigo",
  variant = "inline",
  message = "",
  subMessage = "",
  show = true,
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  // Border size based on spinner size
  const borderSizes = {
    sm: "border-2",
    md: "border-3",
    lg: "border-4",
    xl: "border-4",
  };

  // Color classes mapping (outer ring)
  const outerColorClasses = {
    indigo: "border-gray-200 dark:border-gray-700",
    purple: "border-gray-200 dark:border-gray-700",
    blue: "border-gray-200 dark:border-gray-700",
    white: "border-white/30",
  };

  // Color classes mapping (spinning inner part)
  const innerColorClasses = {
    indigo: "border-t-indigo-500 dark:border-t-indigo-400",
    purple: "border-t-purple-500 dark:border-t-purple-400",
    blue: "border-t-blue-500 dark:border-t-blue-400",
    white: "border-t-white",
  };

  // Get the appropriate classes based on props
  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const borderSize = borderSizes[size] || borderSizes.md;
  const outerColor = outerColorClasses[color] || outerColorClasses.indigo;
  const innerColor = innerColorClasses[color] || innerColorClasses.indigo;

  // The spinner animation - dual ring design
  const spinner = (
    <div className="relative">
      {/* Outer static ring */}
      <div
        className={`${spinnerSize} ${borderSize} ${outerColor} rounded-full`}
        aria-hidden="true"
      />
      {/* Inner spinning ring */}
      <div
        className={`absolute top-0 left-0 ${spinnerSize} ${borderSize} border-transparent ${innerColor} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  // Inline variant - just the spinner
  if (variant === "inline") {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {spinner}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Page variant - centered with message, for page content areas
  if (variant === "page") {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            className="flex flex-col items-center justify-center h-96 px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative mb-8">
              {spinner}
            </div>
            {message && (
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                {message}
              </h3>
            )}
            {subMessage && (
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-md">
                {subMessage}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // FullScreen variant - overlay with backdrop blur
  if (variant === "fullScreen") {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="relative mb-6">
                {spinner}
              </div>
              {message && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {message}
                </h3>
              )}
              {subMessage && (
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  {subMessage}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default fallback
  return spinner;
};

// PropTypes for component documentation and type checking
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf(["indigo", "purple", "blue", "white"]),
  variant: PropTypes.oneOf(["inline", "fullScreen", "page"]),
  message: PropTypes.string,
  subMessage: PropTypes.string,
  show: PropTypes.bool,
};

export default LoadingSpinner;

