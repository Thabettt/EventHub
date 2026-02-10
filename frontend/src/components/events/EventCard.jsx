import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const EventCard = ({ event, className = "" }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Default image if none provided
  const eventImage =
    event.image || "https://placehold.co/600x400/202020/white?text=No+Image";

  // Check if tickets are sold out
  const isSoldOut = event.remainingTickets === 0;

  // Calculate percentage of tickets sold
  const percentageSold = Math.round(
    ((event.totalTickets - event.remainingTickets) / event.totalTickets) * 100
  );
  const isSellingFast = percentageSold >= 70 && !isSoldOut;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 transition-colors ${className}`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/events/${event._id}`} className="block">
        <div className="relative">
          <div className="overflow-hidden">
            <motion.img
              className="w-full h-52 object-cover transform hover:scale-105 transition-transform duration-700"
              src={eventImage}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/202020/white?text=Error";
              }}
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Premium category badge */}
          <div className="absolute top-0 right-0 m-3">
            <div className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
              {event.category}
            </div>
          </div>

          {/* Date chip */}
          <div className="absolute top-0 left-0 m-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-lg shadow-md flex items-center space-x-1 transition-colors">
            <svg
              className="h-3 w-3 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>

          {/* Price tag */}
          <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center transition-colors">
            ${event.ticketPrice.toFixed(2)}
          </div>

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-xl transform -rotate-12 scale-110 border-2 border-white">
                SOLD OUT
              </div>
            </div>
          )}

          {/* Selling fast badge */}
          {isSellingFast && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md">
                Selling Fast!
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 line-clamp-1">
            {event.title}
          </h3>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center transition-colors">
              <svg
                className="h-4 w-4 mr-2 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="line-clamp-1">{event.location}</span>
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center transition-colors">
              <svg
                className="h-4 w-4 mr-2 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">
                {formatDate(event.date)}
              </span>
            </p>
          </div>

          {/* Ticket availability indicator */}
          {!isSoldOut && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  Ticket availability
                </span>
                <span className="text-gray-500 dark:text-gray-400 transition-colors">
                  {event.remainingTickets}/{event.totalTickets}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
                <div
                  className={`h-2 rounded-full ${
                    percentageSold < 50
                      ? "bg-green-500"
                      : percentageSold < 80
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percentageSold}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* View Details button - outside the Link to allow separate styling */}
      <div className="px-5 pb-5">
        <Link
          to={`/events/${event._id}`}
          className={`block w-full text-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
            isSoldOut
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:translate-y-[-2px] hover:shadow-md"
          }`}
        >
          {isSoldOut ? "Sold Out" : "View Details"}
        </Link>
      </div>
    </motion.div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    image: PropTypes.string,
    ticketPrice: PropTypes.number.isRequired,
    totalTickets: PropTypes.number.isRequired,
    remainingTickets: PropTypes.number.isRequired,
  }).isRequired,
};

export default EventCard;
