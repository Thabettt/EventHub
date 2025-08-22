import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import Footer from "../components/layout/Footer";

// Import placeholder images - replace with your actual images
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
const FEATURED_EVENT_1 =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop";
const FEATURED_EVENT_2 =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop";
const FEATURED_EVENT_3 =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop";
const TESTIMONIAL_1 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop";
const TESTIMONIAL_2 =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop";
const TESTIMONIAL_3 =
  "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=200&auto=format&fit=crop";

// Update the fadeInUp animation variant to be slower
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8, // Increased from 0.6 to 0.8
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

// Custom animation hook with significantly delayed trigger
const useScrollAnimation = (threshold = 0.05) => {
  // Lowered from 0.3 to 0.05
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, {
    once: true,
    threshold: threshold,
    margin: "0px 0px -100px 0px", // Changed to -300px to trigger much later
  });

  useEffect(() => {
    if (inView) {
      // Add a longer delay before starting animation
      setTimeout(() => {
        controls.start("visible");
      }, 400); // Increased from 200ms to 400ms delay
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return [ref, controls];
};

// Animated Section component - much later animation trigger
const AnimatedSection = ({
  children,
  className,
  variants,
  initial = "hidden",
  id,
  threshold = 0.05, // Lowered from 0.4 to 0.05
}) => {
  const [ref, controls] = useScrollAnimation(threshold);

  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      initial={initial}
      animate={controls}
      variants={variants || fadeInUp}
    >
      {children}
    </motion.section>
  );
};

const LandingPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Header floating animation effect
  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  };

  return (
    <div className="landing-page bg-inherit text-inherit">
      {/* Ultimate Hero Section */}
      <section className="relative min-h-[120vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 md:-mt-20 m-0">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-indigo-600/20"></div>

          {/* Floating orbs - responsive sizing */}
          <motion.div
            className="absolute top-1/4 left-1/6 md:left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/6 md:right-1/4 w-48 h-48 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center py-20 flex flex-col items-center justify-center min-h-screen -mt-20">
          {/* Brand logo and name - mobile optimized */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3 sm:gap-0">
              {/* Logo icon - responsive sizing */}
              <motion.div
                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mr-4 shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>

              {/* Brand name - mobile optimized typography */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent tracking-tight"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                EventHub
              </motion.h1>
            </div>

            {/* Brand tagline - responsive width: full on mobile, 256px on desktop */}
            <motion.div
              className="h-1 w-full sm:w-64 bg-gradient-to-r from-purple-400 to-indigo-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: isMobile ? "100%" : 680,
              }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </motion.div>

          {/* Main headline - mobile optimized */}
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight max-w-5xl mx-auto px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Discover{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Extraordinary
            </span>{" "}
            Events
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Create{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Unforgettable
            </span>{" "}
            Memories
          </motion.h2>

          {/* Subheadline - mobile optimized */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-slate-200 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            Join thousands who trust EventHub to discover premium events,
            connect with their passions, and create moments that matter.
          </motion.p>

          {/* CTA buttons - mobile optimized */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            {/* Primary CTA - mobile optimized */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/events"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base sm:text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                <span className="relative flex items-center">
                  Explore Events
                  <motion.svg
                    className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </span>
              </Link>
            </motion.div>

            {/* Secondary CTA - mobile optimized */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl"
              >
                <span className="relative flex items-center">
                  <svg
                    className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Join Free
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof indicators - mobile optimized */}
          <motion.div
            className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-slate-300 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-2 border-white/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-medium">
                100K+ Happy Users
              </span>
            </div>

            <div className="flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">4.9 Rating</span>
            </div>

            <div className="flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                Trusted Platform
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade to blend with next section - ultra smooth */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 via-gray-50/60 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:via-gray-900/60 dark:via-gray-900/40 dark:via-gray-900/20 pointer-events-none"></div>
      </section>

      {/* Featured Events Section */}
      <AnimatedSection
        id="featured"
        className="relative bg-gray-50 dark:bg-gray-900"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h4
              className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2"
              variants={fadeInUp}
            >
              Don't Miss Out
            </motion.h4>
            <motion.h2
              className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors"
              variants={fadeInUp}
            >
              Featured Events
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors"
              variants={fadeInUp}
            >
              Discover our handpicked selection of the most exciting upcoming
              events in your area.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                title: "Music Festival 2023",
                image: FEATURED_EVENT_1,
                date: "August 15, 2023",
                location: "Central Park",
                price: "$49.99",
              },
              {
                title: "Tech Conference",
                image: FEATURED_EVENT_2,
                date: "September 20, 2023",
                location: "Convention Center",
                price: "$149.99",
                featured: true,
              },
              {
                title: "Food & Wine Expo",
                image: FEATURED_EVENT_3,
                date: "July 8, 2023",
                location: "Riverside Plaza",
                price: "$29.99",
              },
            ].map((event, index) => (
              <motion.div
                key={index}
                className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group dark:border dark:border-gray-800 ${
                  event.featured ? "ring-2 ring-indigo-500" : ""
                }`}
                variants={fadeInScale}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {event.featured && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
                      {event.title}
                    </h3>
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 transition-colors">
                      {event.price}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">
                    <svg
                      className="w-4 h-4 mr-1 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {event.date}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
                    <svg
                      className="w-4 h-4 mr-1 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {event.location}
                  </div>

                  <Link
                    to={`/events/${index + 1}`}
                    className="w-full block text-center bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center mt-12" variants={fadeInUp}>
            <Link
              to="/events"
              className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
            >
              View all events
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* How It Works Section */}
      <AnimatedSection
        className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors"
        variants={staggerContainer}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-300 rounded-full"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-purple-300 rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-20 transition-colors"
          >
            How It <span className="text-indigo-600">Works</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: (
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
                title: "Find Events",
                description:
                  "Search for events by category, location, or date. Filter to find exactly what you're looking for.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                ),
                title: "Book Tickets",
                description:
                  "Secure your spot with our easy booking system. Pay safely with multiple payment options.",
              },
              {
                icon: (
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                ),
                title: "Enjoy the Event",
                description:
                  "Show up with your digital ticket, create lasting memories, and share your experience.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 transition-colors"
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs transition-colors">
                  {step.description}
                </p>

                {index < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-32"
                    style={{ left: `${33 + index * 33}%` }}
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg
                      className="w-12 h-12 text-indigo-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Features Highlight Section */}
      <AnimatedSection
        className="py-24 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900 transition-colors"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
              Why Choose <span className="text-indigo-600">EventHub</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors">
              Our platform offers everything you need for a seamless event
              experience from start to finish.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                icon: "📅",
                title: "Curated Events",
                description:
                  "Hand-selected events that promise exceptional experiences.",
              },
              {
                icon: "🎟️",
                title: "Easy Booking",
                description: "Simple and secure ticket booking process.",
              },
              {
                icon: "🌟",
                title: "Recommendations",
                description: "Personalized event suggestions just for you.",
              },
              {
                icon: "🔒",
                title: "Secure Payments",
                description: "Your transactions are always protected.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 transition-colors"
                variants={fadeInScale}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection
        className="py-24 bg-white dark:bg-gray-900 transition-colors"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              Testimonials
            </h4>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
              What People Are Saying
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={staggerContainer}
          >
            {[
              {
                name: "Emma Thompson",
                avatar: TESTIMONIAL_1,
                role: "Event Enthusiast",
                text: "I've discovered so many amazing events through this platform. The booking process is seamless and I love the reminder features!",
              },
              {
                name: "Michael Chen",
                avatar: TESTIMONIAL_2,
                role: "Regular Attendee",
                text: "As someone who attends events frequently, this site has been a game-changer. The recommendations are spot-on and I've never had any issues with tickets.",
              },
              {
                name: "Sarah Johnson",
                avatar: TESTIMONIAL_3,
                role: "Event Organizer",
                text: "From an organizer's perspective, this platform gives us incredible tools to manage our events and connect with our audience. Highly recommended!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
                variants={fadeInUp}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800 transition-colors"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic transition-colors">
                  {testimonial.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection
        className="py-24 bg-indigo-900 text-white"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
          >
            {[
              { number: "500+", label: "Events" },
              { number: "100K+", label: "Tickets Sold" },
              { number: "50+", label: "Cities" },
              { number: "10K+", label: "Happy Users" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-indigo-800/50 backdrop-blur-sm rounded-xl p-8"
                variants={fadeInScale}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-indigo-200">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Newsletter Section */}
      <AnimatedSection
        className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors"
        variants={fadeInUp}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
              Stay Updated on New Events
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors">
              Join our newsletter and be the first to know about exciting events
              in your area.
            </p>

            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-6 py-4 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
              <motion.button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Final CTA Section */}
      <AnimatedSection
        className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        variants={fadeInUp}
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Discover Amazing Events?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of event-goers who are making unforgettable memories
            through our platform.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            whileInView={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              to="/events"
              className="bg-white text-indigo-600 hover:bg-yellow-300 hover:text-indigo-800 px-8 py-4 rounded-full text-lg font-semibold shadow-lg inline-block transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Events
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold inline-block transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Account
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default LandingPage;
