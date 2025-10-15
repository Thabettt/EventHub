import React from "react";
import { Link } from "react-router-dom";

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
  // Base styles with brightness hover effect
  const baseStyles =
    "group relative inline-flex items-center justify-center font-bold tracking-wide rounded-2xl shadow-lg transition-all duration-200 overflow-hidden";

  // Size variants
  const sizeStyles = {
    small: "px-6 py-2 text-[14px]",
    default: "px-7 py-3 text-[17px]",
    large: "px-10 py-5 text-[20px]",
    square: "p-4 text-[17px]",
  };

  // Color variants
  const variantStyles = {
    primary: "bg-[#6600FF] text-white hover:bg-[#B600FF] hover:shadow-lg",
    secondary:
      "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 hover:shadow-lg",
    outline:
      "bg-transparent border-2 border-[#6600FF] text-[#6600FF] hover:bg-[#B600FF] hover:text-white hover:border-[#B600FF]",
    solid: "bg-[#6600FF] text-white hover:bg-[#B600FF]",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white hover:brightness-110",
    success:
      "bg-gradient-to-r from-green-600 to-green-700 text-white hover:brightness-110",
    back: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 hover:shadow-xl active:scale-95 hover:-translate-x-1",
  };

  // Combine all styles
  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  // Button content with icon support
  const buttonContent = (
    <>
      <span className="relative flex items-center justify-center">
        {/* Left-side icon: custom left icon OR back-arrow (when no custom icon) */}
        {icon && iconPosition === "left" ? (
          <span className="mr-2 flex items-center justify-center">{icon}</span>
        ) : (
          !icon &&
          variant === "back" && (
            <svg
              className={`w-5 h-5 flex-shrink-0 ${children ? "mr-2" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )
        )}

        {children}

        {/* Right-side icon: custom right icon OR primary-arrow (when no custom icon) */}
        {icon && iconPosition === "right" ? (
          <span className="ml-2 flex items-center justify-center">{icon}</span>
        ) : (
          !icon &&
          variant === "primary" &&
          children && (
            <svg
              className="ml-2 w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )
        )}
      </span>
    </>
  );

  // Handle back button with browser history API
  if (variant === "back") {
    const handleBack = (e) => {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      } else {
        window.history.back();
      }
    };

    // Use square size if no children text
    const backSize = children ? size : "square";
    const backClasses = `${baseStyles} ${sizeStyles[backSize]} ${variantStyles[variant]} ${className}`;

    return (
      <button
        type={type}
        onClick={handleBack}
        disabled={disabled}
        className={`${backClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }

  // Handle different button types (regular button, link, router link)
  if (href) {
    // External link
    return (
      <a href={href} className={buttonClasses} {...props}>
        {buttonContent}
      </a>
    );
  }

  if (to) {
    // Router link
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {buttonContent}
      </Link>
    );
  }

  // Regular button
  return (
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
  );
};

export default Button;
