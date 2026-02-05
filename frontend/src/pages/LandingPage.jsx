import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Footer from "../components/layout/Footer";
import heroVideo from "../assets/media/landing page video.mp4";
import logo from "../assets/logo.png";
import { getEvents } from "../services/eventService";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
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

// Custom animation hook
const useScrollAnimation = (threshold = 0.05) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, {
    once: true,
    threshold: threshold,
    margin: "0px 0px -100px 0px",
  });

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        controls.start("visible");
      }, 400);
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return [ref, controls];
};

// Animated Section component
const AnimatedSection = ({
  children,
  className,
  variants,
  initial = "hidden",
  id,
  threshold = 0.05,
  background,
  style, // Add style prop support
}) => {
  const [ref, controls] = useScrollAnimation(threshold);

  return (
    <section id={id} className={className} style={style}>
      {/* Static Background that loads immediately */}
      {background}
      
      {/* Animated Content */}
      <motion.div
        ref={ref}
        initial={initial}
        animate={controls}
        variants={variants || fadeInUp}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
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

    // Init Lenis
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
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

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", setMotion);
      lenis.destroy();
    };
  }, []);
  
  // ==================================================================================
  // HERO LAYOUT CONTROLS - Adjust these values to fine-tune the hero section
  // ==================================================================================
  const layoutConfig = {
    desktopTopOffset: "md:-mt-36",    // Adjust vertical center position (Try: md:pt-10, md:pt-0, md:-mt-10)
    mobileTopOffset: "pt-0",       // Adjust mobile vertical center position
    elementSpacing: "space-y-6",    // Spacing between main elements (Try: space-y-4, space-y-8)
    titlePadding: "py-4",           // Vertical padding around gradients to prevent clipping
  };

  return (
    <div className="landing-page bg-inherit text-inherit">
      {/* Hero Section */}
      <section 
        className="relative h-screen md:min-h-[calc(100vh+10rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 m-0 md:-mt-20 z-40"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
        }}
      >
        {/* Video Background - Visible on all devices for immersion */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-indigo-600/20"></div>

          <motion.div
            className="absolute top-1/4 left-1/6 md:left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-[100px]"
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
            className="absolute bottom-1/4 right-1/6 md:right-1/4 w-48 h-48 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-[100px]"
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
        </div>

        {/* Main content */}
        <div className={`relative z-10 container mx-auto px-4 sm:px-6 text-center h-full min-h-screen flex flex-col items-center justify-center ${layoutConfig.mobileTopOffset} ${layoutConfig.desktopTopOffset}`}>
          <motion.div
            className={`w-full max-w-6xl mx-auto flex flex-col items-center ${layoutConfig.elementSpacing}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Brand logo and name */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-white tracking-tighter drop-shadow-sm leading-tight ${layoutConfig.titlePadding}`}>
                  EventHub
                </h1>
              </div>

              <div className="h-2 w-32 sm:w-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
            </motion.div>

            {/* Main headline */}
            <motion.h2
              className={`relative z-10 text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.15] tracking-tight drop-shadow-xl px-4 ${layoutConfig.titlePadding}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 relative inline-block">
                Extraordinary
                <span className="absolute -inset-1 blur-2xl bg-purple-600/20 -z-10 rounded-full"></span>
              </span> Events
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300 relative inline-block">
                Unforgettable
                <span className="absolute -inset-1 blur-2xl bg-indigo-600/20 -z-10 rounded-full"></span>
              </span> Memories
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              className="relative z-10 text-lg sm:text-xl md:text-2xl text-slate-100 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md pb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Join thousands who trust EventHub to discover premium events,
              connect with their passions, and create moments that matter.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <Link
                to="/events"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  Explore Events
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link
                to="#featured"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md text-white font-bold text-xl rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          
        </div>


      </section>

      {/* Section 2: Who We Are */}
      <AnimatedSection 
        className="min-h-screen flex items-center bg-white dark:bg-black relative -mt-[200px] z-30"

        background={
          null
        }
      >

        <div className="container mx-auto px-6 relative z-50 h-full flex flex-col md:flex-row items-center pt-[200px] pb-24 md:pb-0">
          
          {/* Left: Text Content */}
          <div className="md:w-1/2 mb-12 md:mb-0 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">
                Our Identity
              </p>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-gray-900 dark:text-white tracking-tighter mb-8 py-2">
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

           {/* Right: Image */}
           <div className="md:w-1/2 h-[50vh] md:h-screen w-full relative translate-x-[24px]">
             <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white dark:via-black/50 dark:to-black z-10"></div>
             <motion.img 
               src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop" 
               alt="Crowd at concert"
               className="w-full h-full object-cover"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Section 3: Featured Events */}
      <AnimatedSection 
        id="featured" 
        className="bg-gray-50 dark:bg-zinc-900 relative -mt-[250px] z-20"
        background={
          /* Top gradient - starts after overlap so it bleeds FROM Identity black, but is UNDER Featured Content */
          <div className="absolute top-[250px] left-0 right-0 h-[250px] bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none z-[1]"></div>
        }
      >
        <div className="absolute top-[250px] left-0 right-0 h-[250px] bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none z-[1]"></div>
        
        <div className="container mx-auto px-6 pt-[300px] pb-24 relative z-50">
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

      {/* Section 4: Host Your Own Event */}
      <AnimatedSection 
        className="min-h-[120vh] relative overflow-hidden flex items-center justify-center -mt-[1px] z-10"
        style={{
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
        }}
        background={
          /* Background Image - Static */
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&auto=format&fit=crop" 
              alt="Event Organizer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80"></div>
            
            {/* Top gradient overlay - bleeds darker gray down from Featured section */}
            <div className="absolute top-0 left-0 right-0 h-[250px] bg-gradient-to-b from-gray-50 dark:from-zinc-900 to-transparent pointer-events-none z-[1]"></div>
          </div>
        }
      >
        <div className="container mx-auto px-6 relative z-50 text-center">
          <motion.h2 
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 py-4"
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

      {/* Section 5: Newsletter */}
      <AnimatedSection 
        className="bg-white dark:bg-black relative -mt-[200px] z-[5] min-h-[75vh] flex flex-col justify-center"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
        }}
        background={
          null
        }
      >
        <div className="container mx-auto px-6 pt-[275px] pb-24">
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
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all outline-none text-gray-900 dark:text-white mb-4 md:mb-0"
                required
              />
              <motion.button
                type="submit"
                className="w-full md:absolute md:top-2 md:right-2 md:bottom-2 md:w-auto mt-4 md:mt-0 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 md:py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Footer Section */}
      <div className="relative -mt-[200px] z-[2] pt-[200px]">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;