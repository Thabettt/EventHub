import React, { useRef } from "react";
import { motion } from "framer-motion";
import EventCard from "../../components/events/EventCard";
import Button from "../../components/common/Button";

const HorizontalRail = ({ title, events, items, isLoading, renderItem }) => {
  const scrollContainerRef = useRef(null);
  const data = items || events || [];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-48 mb-6 rounded-lg"></div>
        <div className="flex space-x-6 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[300px] h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="py-6 relative w-full overflow-hidden my-4">
      
      {/* Container for title to keep it aligned with page content, but rail goes full width */}
      <div className="max-w-[96%] mx-auto mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">
            {title}
          </h2>
          <div className="h-2 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-2"></div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => scroll("left")}
            className="!w-10 !h-10 !p-0 !rounded-lg !bg-white/10 !border-white/20 hover:!bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
          </Button>
          <Button
            variant="secondary"
            onClick={() => scroll("right")}
            className="!w-10 !h-10 !p-0 !rounded-lg !bg-white/10 !border-white/20 hover:!bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8"
        style={{ 
            scrollBehavior: "smooth",
            paddingLeft: "max(1rem, 2%)",
            paddingRight: "max(1rem, 2%)" 
        }}
      >
        {data.map((item, index) => (
          <motion.div
            key={item._id || item.id || index}
            className="min-w-[300px] md:min-w-[350px] snap-start"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            {renderItem ? (
              renderItem(item)
            ) : (
              <EventCard event={item} className="h-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300" />
            )}
          </motion.div>
        ))}
        {/* Padding div */}
        <div className="min-w-[1px] snap-start"></div> 
      </div>
    </div>
  );
};

export default HorizontalRail;
