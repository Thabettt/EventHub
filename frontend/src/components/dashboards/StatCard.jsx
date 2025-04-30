import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`${color} bg-opacity-15 p-3 rounded-full mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-gray-900 text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;