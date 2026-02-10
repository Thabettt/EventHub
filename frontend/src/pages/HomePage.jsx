import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { getEvents } from "../services/eventService";
import LoadingSpinner from "../components/layout/LoadingSpinner";
import HorizontalRail from "../components/events/HorizontalRail";
import Footer from "../components/layout/Footer";
import Button from "../components/common/Button";

// Icons 
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Ticket: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [nextTicket, setNextTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch trending/top events
        const trendingResponse = await getEvents({ sort: "popularity", limit: 6 });
        if (trendingResponse.success) {
          setTrendingEvents(trendingResponse.data);
        }

        // Fetch upcoming events (newest first)
        const upcomingResponse = await getEvents({ sort: "date", limit: 6 });
        if (upcomingResponse.success) {
             setUpcomingEvents(upcomingResponse.data);
        }

        // Fetch user's next booking
        const token = localStorage.getItem("token");
        if (token) {
           const bookingsResponse = await fetch("http://localhost:3003/api/bookings/me", {
               headers: { Authorization: `Bearer ${token}` },
           });
           const bookingsResult = await bookingsResponse.json();
           
           if (bookingsResult.success && bookingsResult.data && bookingsResult.data.length > 0) {
               // Filter for future events and sort by date
               const now = new Date();
               const userUpcoming = bookingsResult.data
                   .filter(b => b.event && new Date(b.event.date) > now && b.status !== 'cancelled')
                   .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
               
               if (userUpcoming.length > 0) {
                   setNextTicket(userUpcoming[0]);
               }
           }
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchData();
    }
  }, [currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F13]">
        <LoadingSpinner size="lg" color="indigo" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] text-gray-900 dark:text-gray-200 font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px] opacity-60" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-500/10 to-teal-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 pt-8 pb-20">
        
        {/* Welcome Header */}
        <div className="container mx-auto px-4 md:px-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider text-sm"
                    >
                        {getGreeting()}
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight"
                    >
                        {currentUser?.name?.split(' ')[0]}
                    </motion.h1>
                </div>

                <motion.form 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSearch} 
                    className="w-full md:w-auto relative group"
                >
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <Icons.Search />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search events, artists, venues..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 pl-12 pr-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-lg hover:shadow-xl dark:shadow-none text-sm font-medium backdrop-blur-sm"
                    />
                </motion.form>
            </div>
        </div>

        {/* Hero Section: Next Ticket or Featured */}
        <div className="container max-w mx-auto px-4 md:px-8 mb-16">
            {nextTicket ? (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#1a1a20] to-[#0F0F13] border border-white/10 shadow-2xl shadow-indigo-900/20"
                >
                    <div className="absolute inset-0 z-0">
                         {/* Abstract background for ticket */}
                         <img 
                            src={nextTicket.event.images?.[0] || nextTicket.event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop"}
                            className="w-full h-full object-cover opacity-30 blur-xl scale-110"
                            alt=""
                         />
                         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-12 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                Your Next Event
                            </div>
                            
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                {nextTicket.event.title}
                            </h2>
                            
                            <div className="flex flex-wrap gap-6 text-gray-300">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Icons.Calendar />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Date</p>
                                        <p className="font-semibold text-white">{new Date(nextTicket.event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Icons.Clock />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Time</p>
                                        <p className="font-semibold text-white">
                                            {new Date(nextTicket.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Icons.Location />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Location</p>
                                        <p className="font-semibold text-white">{nextTicket.event.location || nextTicket.event.city}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link 
                                    to="/tickets"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 group"
                                >
                                    View Ticket
                                    <span className="group-hover:translate-x-1 transition-transform">
                                        <Icons.ArrowRight />
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                             {/* Faux Ticket Visual */}
                            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 rotate-2 hover:rotate-0 transition-transform duration-500 max-w-[370px] mx-auto">
                                <div className="h-[400px] w-full rounded-2xl overflow-hidden relative shadow-2xl">
                                    <img 
                                        src={nextTicket.event.images?.[0] || nextTicket.event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop"}
                                        className="w-full h-full object-cover"
                                        alt={nextTicket.event.title}
                                    />
                                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                        <div className="bg-white p-2 rounded-lg w-12 h-12 mb-2 flex items-center justify-center">
                                            {/* QR Code Placeholder */}
                                            <div className="grid grid-cols-3 gap-0.5 w-8 h-8 opacity-80">
                                                {[...Array(9)].map((_, i) => (
                                                    <div key={i} className={`bg-black ${i%2===0 ? 'col-span-1' : ''} rounded-[1px]`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">{(nextTicket._id || nextTicket.id || "").substring(0, 8)}...</p>
                                    </div>
                                </div>
                                {/* Perforated lines decoration */}
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0F0F13] rounded-full" />
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0F0F13] rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2.5rem] overflow-hidden min-h-[100px] flex items-center justify-center text-center bg-[#1a1a20]"
                >
                    <div className="absolute inset-0">
                         <img 
                            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&auto=format&fit=crop"
                            className="w-full h-full object-cover opacity-60"
                            alt="Concert crowd"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F13] via-transparent to-transparent" />
                    </div>
                    
                    <div className="relative z-10 max-w-4xl px-6 py-12">
                         <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                             Your next memory is waiting.
                         </h2>
                         <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
                             Explore the most happening events in your city. From underground gigs to massive festivals.
                         </p>
                         <Button
                            to="/events"
                            size="large"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xl px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-300 transform"
                         >
                             Explore Events
                         </Button>
                    </div>
                </motion.div>
            )}
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-1 md:px-4 mb-16">
             <div className="max-w-[96%] mx-auto mb-6 flex justify-between items-end">
                 <div>
                     <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2 drop-shadow-md">Discover</h2>
                     <div className="h-2 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-2"></div>
                 </div>
                 <Link to="/events" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline mb-2">View Categories</Link>
             </div>
             
             <div className="max-w-[96%] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                     { name: 'Music', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop', color: 'from-pink-500 to-rose-500' },
                     { name: 'Arts', img: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop', color: 'from-purple-500 to-indigo-500' },
                     { name: 'Food', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop', color: 'from-orange-500 to-amber-500' },
                     { name: 'Tech', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop', color: 'from-blue-500 to-cyan-500' }
                 ].map((cat, idx) => (
                     <Link to={`/events?category=${cat.name}`} key={idx} className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer">
                         <div className="absolute inset-0">
                             <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-90`} />
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center p-4">
                             <h3 className="text-2xl font-black text-white tracking-tight">{cat.name}</h3>
                         </div>
                     </Link>
                 ))}
             </div>
        </div>

        {/* Trending Rail */}
        <div className="container mx-auto px-1 md:px-4 mb-8">
             <HorizontalRail 
                title="Trending Now" 
                events={trendingEvents} 
                isLoading={loading} 
             />
        </div>

        {/* Just Announced Rail */}
        <div className="container mx-auto px-1 md:px-4">
             <HorizontalRail 
                title="Just Announced" 
                events={upcomingEvents} 
                isLoading={loading} 
             />
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default HomePage;