import React from "react";
import { Link } from "react-router-dom";

const EventsList = ({ events, type }) => {
  // Format a date string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar">
      {events.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 transition-colors">
          No events found.
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 transition-colors"
            >
              <Link
                to={`/organizer/events/${event.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate transition-colors">
                    {event.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    {formatDate(event.date)}
                  </span>
                </div>

                {type === "recent" ? (
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors">
                      {event.ticketsSold} tickets sold
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400 transition-colors">
                      ${event.revenue.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors">
                      {event.soldTickets}/{event.totalTickets} tickets
                    </span>

                    {/* Progress bar for ticket sales */}
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-colors">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${
                            (event.soldTickets / event.totalTickets) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsList;
