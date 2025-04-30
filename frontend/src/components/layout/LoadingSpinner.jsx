import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  size = "md",
  color = "indigo",
  fullScreen = false,
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  // Color classes mapping
  const colorClasses = {
    indigo: "border-indigo-600",
    purple: "border-purple-600",
    blue: "border-blue-600",
    gray: "border-gray-600",
  };

  // Get the appropriate classes based on props
  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const spinnerColor = colorClasses[color] || colorClasses.indigo;

  // Create the spinner component
  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${spinnerSize} border-4 border-t-4 ${spinnerColor} border-opacity-25 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  // If fullScreen is true, center the spinner on the screen
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// PropTypes for component documentation and type checking
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf(["indigo", "purple", "blue", "gray"]),
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
