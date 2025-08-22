import React from "react";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-lg shadow-sm transition-colors">
      <div className="flex items-center">
        <div
          className={`${color} bg-opacity-15 dark:bg-opacity-25 p-3 rounded-full mr-4`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {title}
          </h3>
          <p className="text-gray-900 dark:text-gray-100 text-2xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
