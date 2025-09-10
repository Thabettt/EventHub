import React from "react";

const RevenueChart = ({ data = [] }) => {
  // All 12 months of the year
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Create a complete data structure for all 12 months
  const monthlyData = months.map((month) => {
    const monthData = data.find((item) => item.month === month);
    return {
      month,
      revenue: monthData?.revenue || 0,
      ticketsSold: monthData?.ticketsSold || 0,
      freeTicketsSold: monthData?.freeTicketsSold || 0,
    };
  });

  // Find the maximum values for proper scaling
  const maxRevenue = Math.max(...monthlyData.map((item) => item.revenue), 1);
  const maxTickets = Math.max(
    ...monthlyData.map((item) => item.ticketsSold),
    1
  );

  const chartHeight = 320;
  const minBarHeight = 6;

  return (
    <div className="w-full py-6">
      {/* Chart Container */}
      <div className="relative" style={{ height: `${chartHeight + 50}px` }}>
        {/* Horizontal Grid Lines */}
        <div className="absolute inset-0 pb-8 px-4">
          {[0, 25, 50, 75, 100].map((percentage, index) => (
            <div
              key={index}
              className="absolute w-full border-gray-200 dark:border-gray-700"
              style={{
                bottom: `${20 + (chartHeight * percentage) / 100}px`,
                borderTopWidth: percentage === 100 ? "0px" : "1px",
                borderStyle: "dashed",
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        {/* Chart Area */}
        <div
          className="relative flex items-end justify-between h-full pb-8 px-4"
          style={{ paddingBottom: "-50px" }}
        >
          {monthlyData.map((item, index) => {
            const ticketHeight =
              item.ticketsSold > 0
                ? Math.max(
                    (item.ticketsSold / maxTickets) * chartHeight,
                    minBarHeight
                  )
                : minBarHeight;
            const revenueHeight =
              item.revenue > 0
                ? Math.max(
                    (item.revenue / maxRevenue) * chartHeight,
                    minBarHeight
                  )
                : minBarHeight;
            const hasData = item.ticketsSold > 0 || item.revenue > 0;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group cursor-pointer"
              >
                {/* Bars Container */}
                <div
                  className="flex justify-center space-x-2 mb-3 relative"
                  style={{ height: `${chartHeight}px` }}
                >
                  {/* Tickets Bar */}
                  <div className="flex flex-col justify-end">
                    <div
                      className={`w-6 transition-all duration-300 ease-out rounded-t-lg ${
                        hasData
                          ? "bg-blue-500 group-hover:bg-blue-600 group-hover:scale-110 shadow-md group-hover:shadow-lg"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      style={{
                        height: `${ticketHeight}px`,
                        transformOrigin: "bottom center",
                      }}
                    ></div>
                  </div>

                  {/* Revenue Bar */}
                  <div className="flex flex-col justify-end">
                    <div
                      className={`w-6 transition-all duration-300 ease-out rounded-t-lg ${
                        hasData
                          ? "bg-emerald-500 group-hover:bg-emerald-600 group-hover:scale-110 shadow-md group-hover:shadow-lg"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      style={{
                        height: `${revenueHeight}px`,
                        transformOrigin: "bottom center",
                      }}
                    ></div>
                  </div>

                  {/* Tooltip */}
                  {hasData && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out scale-90 group-hover:scale-100 z-30 pointer-events-none">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl min-w-max backdrop-blur-sm">
                        <div className="text-center mb-3">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {item.month}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Tickets
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {item.ticketsSold.toLocaleString()}
                            </span>
                          </div>
                          {item.freeTicketsSold > 0 && (
                            <div className="flex items-center justify-between gap-4 ml-4">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Free tickets
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {item.freeTicketsSold.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Revenue
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              ${item.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
                          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Month Label */}
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
