import React from 'react';

const RevenueChart = ({ data }) => {
  // Find the max revenue to calculate bar heights
  const maxRevenue = Math.max(...data.map(item => item.revenue));

  return (
    <div className="w-full h-64">
      <div className="flex h-full items-end">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center flex-1"
          >
            <div 
              className="w-full mx-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors relative group"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                ${item.revenue.toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-gray-600 mt-2">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <div className="text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-indigo-500 mr-1 rounded-sm"></span>
          Revenue
        </div>
        <button className="text-xs text-indigo-600 hover:text-indigo-800">Export</button>
      </div>
    </div>
  );
};

export default RevenueChart;