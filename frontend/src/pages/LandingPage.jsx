import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Footer from "../components/layout/Footer";
import heroVideo from "../assets/media/landing page video.mp4";
import logo from "../assets/logo.png";
import { getEvents } from "../services/eventService";

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

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const response = await getEvents({ sort: "popularity", limit: 3 });
        if (response.success) {
          setFeaturedEvents(response.data);
        }
      } catch (error) {
        console.error("Failed to load featured events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopEvents();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Init Lenis only when this component is mounted
    const lenis = new Lenis({
      duration: 1.1, // adjust: higher = smoother/longer inertia
      smoothWheel: true,
      smoothTouch: false,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // smooth ease-out
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Respect reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setMotion = () => (mq.matches ? lenis.stop() : lenis.start());
    mq.addEventListener("change", setMotion);
    setMotion();

    // Cleanup on page exit
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", setMotion);
      lenis.destroy();
    };
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
        {/* Video Background - Hidden on mobile */}
        <div className="absolute inset-0 w-full h-full hidden md:block">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -mt-4"
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Video overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Gradient mesh background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-indigo-600/30"></div>

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
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center py-20 flex flex-col items-center justify-center min-h-screen -mt-28">
          {/* Brand logo and name - mobile optimized */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3 sm:gap-0">
              
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
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base sm:text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
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
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl"
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

      {/* Section 2: Who We Are - Immersive Parallax Text & Image */}
      <AnimatedSection className="min-h-screen flex items-center bg-white dark:bg-black relative overflow-hidden py-24 md:py-0">
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col md:flex-row items-center">
          
          {/* Left: Text Content */}
          <div className="md:w-1/2 mb-12 md:mb-0 relative z-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">
                Our Identity
              </p>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-gray-900 dark:text-white tracking-tighter mb-8">
                We are the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                  heartbeat
                </span>{" "}
                of the city.
              </h2>
              <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-light max-w-xl">
                More than just a platform, we are a movement. A collective of explorers, creators, and dreamers. We believe that every event is a story waiting to be told, and every ticket is a passport to a new experience.
              </p>
              <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-light mt-6 max-w-xl">
                 From the underground beats in a hidden basement to the roaring crowds of a stadium, we are there connecting you to the moments that define us.
              </p>
            </motion.div>
          </div>

          {/* Right: Immersive Image */}
          <div className="md:w-1/2 h-[50vh] md:h-screen w-full relative">
             <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white dark:via-black/50 dark:to-black z-10"></div>
             <motion.img 
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop" 
                alt="Crowd at concert"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true }}
             />
          </div>
        </div>
      </AnimatedSection>

      {/* Section 3: Featured Events - "Pick the most sold" */}
      <AnimatedSection className="py-24 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <motion.h4
                className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2"
                variants={fadeInUp}
              >
                Trending Now
              </motion.h4>
              <motion.h2
                className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight"
                variants={fadeInUp}
              >
                Top Selling
              </motion.h2>
            </div>
            <motion.div variants={fadeInUp}>
              <Link
                to="/events"
                className="group flex items-center text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors"
              >
                View all events
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event._id || index}
                  className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/events/${event._id}`}>
                    {/* Image Background */}
                    <div className="absolute inset-0">
                      <img
                        src={event.images?.[0] || event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop"}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-4 border border-white/10 uppercase tracking-wider">
                        {event.category || "Event"}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2 leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-gray-300 line-clamp-2 mb-4 text-sm font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                        {" • "}
                        {event.city || event.location || "Location"}
                      </p>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <span className="text-indigo-400 font-bold">Get Tickets</span>
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Section 4: Host Your Own Event - Immersive Banner with Image */}
      <AnimatedSection className="min-h-[80vh] relative overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
           <img 
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&auto=format&fit=crop" 
              alt="Event Organizer"
              className="w-full h-full object-cover"
           />
           {/* Dark Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Create.<br className="lg:hidden" /> Share.<br className="lg:hidden" /> Inspire.
          </motion.h2>
          <motion.p 
            className="text-2xl md:text-3xl text-indigo-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Turn your passion into an experience. Whether it's an intimate workshop or a massive festival, 
            EventHub empowers you to host with style and simplicity.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
             <Link
               to="/create-event"
               className="inline-flex items-center justify-center px-12 py-6 bg-white text-indigo-900 rounded-full text-xl font-bold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-2xl shadow-indigo-900/50"
             >
               Start Hosting
               <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
             </Link>
             <Link
               to="/organizer-info"
               className="inline-flex items-center justify-center px-12 py-6 bg-transparent border-2 border-white text-white rounded-full text-xl font-bold hover:bg-white/10 transition-all"
             >
               Learn More
             </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Section 5: Newsletter - Minimalist */}
      <AnimatedSection className="py-24 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              The Digest
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Curated events, delivered weekly. No spam, ever.
            </p>

            <form className="relative">
              <input
                type="email"
                placeholder="you@domain.com"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 transition-all outline-none text-gray-900 dark:text-white mb-4 md:mb-0 md:pr-32"
                required
              />
              <motion.button
                type="submit"
                className="w-full md:w-auto md:absolute md:top-2 md:right-2 md:bottom-2 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default LandingPage;
