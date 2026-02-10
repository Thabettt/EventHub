import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import Button from "../../components/common/Button";

// Icon components (Unchanged)
const Icons = {
  Calendar: () => (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  Close: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Search: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  ),
  Filter: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>
  ),
  Back: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  )
};

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
           initial={{ scale: 0.95, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.95, opacity: 0, y: 20 }}
           className="relative w-full max-w-lg bg-[#15151a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
           <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                 <Icons.Close />
              </button>
           </div>
           
           <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {children}
           </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Ticket Status Badge
const BookingStatus = ({ status }) => {
  const styles = {
    confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    default: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  };
  const currentStyle = styles[status?.toLowerCase()] || styles.default;
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentStyle} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}>
      {status}
    </span>
  );
};

// Ticket Preview Modal Component
const TicketPreviewModal = ({ isOpen, onClose, booking }) => {
   if (!booking) return null;

   return (
     <Modal isOpen={isOpen} onClose={onClose} title="Ticket Details">
        <div className="space-y-6">
            {/* Event Header */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-white/10 text-center">
                 <h2 className="text-2xl font-black text-white mb-2">{booking.eventName}</h2>
                 <div className="flex justify-center gap-4 text-sm text-gray-300">
                     <span className="flex items-center gap-1"><Icons.Calendar /> {new Date(booking.date).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><Icons.Clock /> {booking.time}</span>
                 </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`} 
                  alt="Ticket QR Code" 
                  className="w-full h-full object-contain"
                />
            </div>
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest">Scan at entrance</p>

            {/* Ticket Info Grid */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ticket ID</p>
                     <p className="text-white font-mono text-sm truncate">{booking.id}</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                     <BookingStatus status={booking.status} />
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Quantity</p>
                     <p className="text-white font-medium">{booking.ticketType}</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Paid</p>
                     <p className="text-indigo-400 font-bold text-lg">${booking.totalPrice?.toFixed(2) || '0.00'}</p>
                 </div>
            </div>
            
             <button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">
                Close
            </button>
        </div>
     </Modal>
   );
};

// Premium Ticket Component
const TicketCard = ({ booking, onClick }) => (
  <motion.div
    onClick={() => onClick(booking)}
    className="group cursor-pointer relative flex flex-col sm:flex-row bg-white/5 dark:bg-[#1a1a20] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Left Side: Event Image / Color Strip */}
    <div className="sm:w-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-800 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center">
            <span className="text-3xl mb-1 block">🎟️</span>
            <div className="text-xs font-bold text-white/75 uppercase tracking-widest">Ticket</div>
        </div>
        {/* Decorative Circles mimicking ticket holes */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-[#0F0F13] rounded-full sm:block hidden transform transition-transform" />
    </div>

    {/* Right Side: Details */}
    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative bg-white/80 dark:bg-white/5 backdrop-blur-sm">
       <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{booking.eventName}</h3>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5"><Icons.Calendar /><span className="text-gray-700 dark:text-gray-300">{new Date(booking.date).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-1.5"><Icons.Clock /><span className="text-gray-700 dark:text-gray-300">{booking.time}</span></div>
                </div>
            </div>
            <BookingStatus status={booking.status} />
       </div>

       <div className="flex justify-between items-end border-t border-black/5 dark:border-white/10 pt-4 mt-2">
            <div>
                 <p className="text-xs text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider mb-0.5">Quantity</p>
                 <p className="text-gray-900 dark:text-white font-medium">{booking.ticketType}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total Paid</p>
                <div className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                    <span className="text-indigo-600 dark:text-indigo-400">$</span>
                    {booking.totalPrice ? booking.totalPrice.toFixed(2) : "0.00"}
                </div>
            </div>
       </div>
    </div>
  </motion.div>
);

const TicketsPage = () => {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();
    
    // Data & Pagination
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Show 5 tickets per page

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        if (!authLoading && currentUser) {
            fetchUserBookings();
        }
    }, [authLoading, currentUser]);

    useEffect(() => {
        filterBookings();
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [searchTerm, filterStatus, bookings]);

    const fetchUserBookings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3003/api/bookings/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch bookings");
            const result = await response.json();

            if (result.success && result.data) {
                const formattedBookings = result.data
                    .filter((booking) => booking.event)
                    .map((booking) => ({
                        id: booking._id,
                        eventName: booking.event.title,
                        date: booking.event.date,
                        time: new Date(booking.event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: booking.status,
                        ticketType: `${booking.ticketsBooked} ticket${booking.ticketsBooked > 1 ? "s" : ""}`,
                        totalPrice: booking.totalPrice,
                        rawDate: new Date(booking.event.date)
                    }))
                    .sort((a, b) => b.rawDate - a.rawDate);
                
                setBookings(formattedBookings);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Failed to load tickets. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const filterBookings = () => {
        let result = [...bookings];

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(b => 
                b.eventName.toLowerCase().includes(lowerTerm) || 
                b.id.toLowerCase().includes(lowerTerm)
            );
        }

        // Status Filter
        if (filterStatus !== "all") {
            result = result.filter(b => b.status.toLowerCase() === filterStatus);
        }

        setFilteredBookings(result);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (authLoading) return <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] flex items-center justify-center"><LoadingSpinner size="lg" color="indigo" /></div>;

    if (!currentUser) return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] flex items-center justify-center text-gray-900 dark:text-white">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Return to Login</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] text-gray-900 dark:text-gray-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
             
            {/* Extended Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-black/80" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-5">
                        <Button
                            size="square"
                            variant="back"
                        />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                My Tickets
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Manage and view all your event bookings</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Icons.Search />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Icons.Filter />
                            </div>
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-40 pl-10 pr-8 py-2.5 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all text-sm cursor-pointer"
                            >
                                <option value="all" className="bg-white dark:bg-[#1a1a20] text-gray-900 dark:text-white">All Status</option>
                                <option value="confirmed" className="bg-white dark:bg-[#1a1a20] text-gray-900 dark:text-white">Confirmed</option>
                                <option value="pending" className="bg-white dark:bg-[#1a1a20] text-gray-900 dark:text-white">Pending</option>
                                <option value="cancelled" className="bg-white dark:bg-[#1a1a20] text-gray-900 dark:text-white">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-32"><LoadingSpinner size="lg" color="indigo" /></div>
                ) : filteredBookings.length > 0 ? (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="grid gap-6 md:gap-8 mb-8"
                        >
                            {currentItems.map((booking) => (
                                <TicketCard key={booking.id} booking={booking} onClick={setSelectedTicket} />
                            ))}
                        </motion.div>


                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center space-x-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous Page"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                            {(() => {
                                const pages = [];
                                
                                if (totalPages <= 7) {
                                     for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    if (currentPage <= 4) {
                                        pages.push(1, 2, 3, 4, 5, '...', totalPages);
                                    } else if (currentPage >= totalPages - 3) {
                                        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                    } else {
                                        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                    }
                                }

                                return pages.map((page, idx) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => paginate(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                                                currentPage === page
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-indigo-600"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ));
                            })()}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next Page"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎫</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {searchTerm || filterStatus !== 'all' ? 'No tickets found' : 'No Bookings Yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            {searchTerm || filterStatus !== 'all' 
                                ? "Try adjusting your search or filters to find what you're looking for." 
                                : "You haven't booked any events yet. Explore upcoming events to get your first ticket!"}
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <Link to="/events" className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all hover:scale-105">
                                Browse Events
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Ticket Preview Modal */}
            <TicketPreviewModal 
                isOpen={!!selectedTicket} 
                onClose={() => setSelectedTicket(null)} 
                booking={selectedTicket} 
            />

        </div>
    );
};

export default TicketsPage;
