import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  href,
  to,
  variant = "primary",
  size = "default",
  disabled = false,
  className = "",
  icon,
  iconPosition = "right",
  type = "button",
  ...props
}) => {
  // Base styles matching the landing page button
  const baseStyles =
    "group relative inline-flex items-center justify-center font-semibold rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden";

  // Size variants
  const sizeStyles = {
    small: "px-6 py-2 text-sm",
    default: "px-8 py-4 text-lg", // Matches landing page button
    large: "px-10 py-5 text-xl",
  };

  // Color variants
  const variantStyles = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-500/25",
    secondary:
      "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 shadow-xl",
    outline:
      "bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    solid: "bg-purple-600 text-white hover:bg-purple-700",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-red-500/25",
    success:
      "bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-green-500/25",
  };

  // Combine all styles
  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  // Icon animation (matches landing page)
  const iconAnimation = {
    x: [0, 4, 0],
    transition: { duration: 1.5, repeat: Infinity },
  };

  // Button content with icon support
  const buttonContent = (
    <>
      {/* Gradient glow effect (matches landing page) */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      )}

      <span className="relative flex items-center">
        {icon && iconPosition === "left" && (
          <motion.span className="mr-2" animate={iconAnimation}>
            {icon}
          </motion.span>
        )}

        {children}

        {icon && iconPosition === "right" && (
          <motion.span className="ml-2" animate={iconAnimation}>
            {icon}
          </motion.span>
        )}

        {/* Default arrow icon if no custom icon provided for primary variant */}
        {!icon && variant === "primary" && (
          <motion.svg
            className="ml-2 w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={iconAnimation}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </motion.svg>
        )}
      </span>
    </>
  );

  // Motion wrapper with hover and tap animations (matches landing page)
  const MotionWrapper = ({ children, ...motionProps }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-full sm:w-auto"
      {...motionProps}
    >
      {children}
    </motion.div>
  );

  // Handle different button types (regular button, link, router link)
  if (href) {
    // External link
    return (
      <MotionWrapper>
        <a href={href} className={buttonClasses} {...props}>
          {buttonContent}
        </a>
      </MotionWrapper>
    );
  }

  if (to) {
    // Router link (requires Link to be imported where used)
    const Link = require("react-router-dom").Link;
    return (
      <MotionWrapper>
        <Link to={to} className={buttonClasses} {...props}>
          {buttonContent}
        </Link>
      </MotionWrapper>
    );
  }

  // Regular button
  return (
    <MotionWrapper>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${buttonClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        {...props}
      >
        {buttonContent}
      </button>
    </MotionWrapper>
  );
};

export default Button;
