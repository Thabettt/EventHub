import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile, changePassword } from "../../services/userService";
import PasswordChangeModal from "../../components/user/PasswordChangeModal";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

// Icon components
const Icons = {
  Success: () => (
    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Error: () => (
    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  Edit: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  Password: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  ),
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
  Logout: () => (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12.59L5.41 11H9V9H5.41L10 4.41 8.59 3 2 9.59 8.59 16 10 14.59z" clipRule="evenodd" />
    </svg>
  ),
  Close: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

// Alert Component
const Alert = ({ type, message, onClose }) => (
  <motion.div
    className="mb-6 relative z-30"
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className={`rounded-xl border p-4 shadow-lg backdrop-blur-sm ${
        type === "success"
          ? "bg-green-500/10 border-green-500/20 text-green-200"
          : "bg-red-500/10 border-red-500/20 text-red-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="mt-0.5">{type === "success" ? <Icons.Success /> : <Icons.Error />}</div>
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <Icons.Close />
          </button>
        )}
      </div>
    </div>
  </motion.div>
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

// Premium Ticket Component
const TicketCard = ({ booking, onClick }) => (
  <motion.div
    onClick={() => onClick(booking)}
    className="group cursor-pointer relative flex flex-col sm:flex-row bg-white/5 dark:bg-[#1a1a20] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loading: authLoading } = useAuth();
  
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewAllTickets, setViewAllTickets] = useState(false);
  
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });

  const autofillStyles = `
    input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px #1a1a20 inset !important; -webkit-text-fill-color: #fff !important; transition: background-color 5000s ease-in-out 0s;
    }
  `;

  useEffect(() => {
    if (!authLoading && currentUser) {
      setUserProfile({ name: currentUser.name || "", email: currentUser.email || "" });
      fetchUserBookings();
    }
  }, [authLoading, currentUser]);

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
          }));
        setUserBookings(formattedBookings);
      } else {
        setUserBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, msg, duration = 5000) => {
    if (type === "success") { setSuccessMessage(msg); setError(""); } 
    else { setError(msg); setSuccessMessage(""); }
    if (duration) setTimeout(() => { type === "success" ? setSuccessMessage("") : setError(""); }, duration);
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      await changePassword(currentPassword, newPassword);
      setIsPasswordModalOpen(false);
      showMessage("success", "Password changed successfully!");
      return true;
    } catch (error) {
      let errorMessage = error.message || "Failed to change password";
      if (error.errors) errorMessage = error.errors.map((err) => err.msg).join(", ");
      showMessage("error", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await updateProfile(userProfile);
      showMessage("success", "Profile updated successfully!");
      setIsEditProfileModalOpen(false);
    } catch (error) {
      showMessage("error", "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) return <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] flex items-center justify-center"><LoadingSpinner size="lg" color="indigo" /></div>;

  if (!currentUser) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] flex items-center justify-center text-gray-900 dark:text-white">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Return to Login</Link>
        </div>
    </div>
  );

  // Determine Role Badge Color and Label
  const getRoleBadge = () => {
      const role = currentUser.role || "User";
      const styles = {
         admin: "bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40 shadow-red-500/20",
         organizer: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40 shadow-purple-500/20",
         user: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 shadow-indigo-500/20"
      };
      // Simple heuristic if role isn't explicit in currentUser object yet (adjust if needed)
      const roleKey = currentUser.isAdmin ? 'admin' : (currentUser.isOrganizer ? 'organizer' : 'user');
      const displayRole = currentUser.isAdmin ? 'System Admin' : (currentUser.isOrganizer ? 'Organizer' : 'Attendee');

      return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-lg backdrop-blur-md ${styles[roleKey]}`}>
              {displayRole}
          </span>
      );
  };
  
  // Decide which tickets to show
  const visibleBookings = viewAllTickets ? userBookings : userBookings.slice(0, 4);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />
      <div className="relative min-h-screen bg-gray-50 dark:bg-[#0F0F13] text-gray-900 dark:text-gray-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
        
        {/* === Breathing Spheres Background (Theme Responsive) === */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 -right-10 w-[55%] h-[55%] rounded-full bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 blur-[100px]"
              animate={{
                x: [0, 20, 0], y: [0, 15, 0], scale: [1, 1.05, 0.98, 1], rotate: [0, 3, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-indigo-600/20 blur-[100px]"
              animate={{
                x: [0, -20, 0], y: [0, -15, 0], scale: [1, 1.08, 0.95, 1], rotate: [0, -2, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            {/* Particles (Dark Mode Only) */}
            <div className="absolute inset-0 opacity-0 dark:opacity-20">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-indigo-400"
                  style={{
                    width: Math.random() * 3 + 1 + "px",
                    height: Math.random() * 3 + 1 + "px",
                    top: Math.random() * 100 + "%",
                    left: Math.random() * 100 + "%",
                  }}
                  animate={{ y: [0, -100], opacity: [0, 0.8, 0] }}
                  transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* === Main Content === */}
        <div className="relative z-10 container mx-auto px-4 py-12 lg:py-20 max-w-6xl">
           
           {/* Messages */}
           <AnimatePresence>
              {(successMessage || error) && (
                  <div className="max-w-2xl mx-auto mb-8">
                     {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
                     {error && <Alert type="error" message={error} onClose={() => setError("")} />}
                  </div>
              )}
           </AnimatePresence>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* === Left Col: Profile & Actions (4 cols) === */}
              <div className="lg:col-span-4 space-y-6">
                  {/* Profile Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                    className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group shadow-xl dark:shadow-none"
                  >
                      {/* Gradient Border Overlay */}
                      <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-3xl z-10 pointer-events-none group-hover:border-indigo-500/30 transition-colors duration-500" />
                      
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 mb-6 shadow-2xl shadow-indigo-500/20">
                          <div className="w-full h-full rounded-full bg-white dark:bg-[#15151a] flex items-center justify-center text-3xl font-black text-gray-800 dark:text-white">
                             {userProfile.name.charAt(0).toUpperCase()}
                          </div>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{userProfile.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{userProfile.email}</p>
                      
                      {getRoleBadge()}

                      <div className="mt-8 w-full space-y-3">
                          <button 
                             onClick={() => setIsEditProfileModalOpen(true)} 
                             className="w-full py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5 rounded-xl text-sm font-semibold text-gray-700 dark:text-white transition-all flex items-center justify-center gap-2"
                          >
                             <Icons.Edit /> Edit Profile
                          </button>
                          <button 
                             onClick={() => setIsPasswordModalOpen(true)}
                             className="w-full py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5 rounded-xl text-sm font-semibold text-gray-700 dark:text-white transition-all flex items-center justify-center gap-2"
                          >
                             <Icons.Password /> Change Password
                          </button>
                          <button 
                             onClick={handleLogout}
                             className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-xl text-sm font-semibold text-red-600 dark:text-red-300 transition-all flex items-center justify-center gap-2 mt-4"
                          >
                             <Icons.Logout /> Sign Out
                          </button>
                      </div>
                  </motion.div>
              </div>

              {/* === Right Col: Bookings & Activity (8 cols) === */}
              <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white">My Bookings</h2>
                      <Link to="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                          Browse Events <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </Link>
                  </div>

                  {isLoading ? (
                      <div className="flex justify-center py-20"><LoadingSpinner color="indigo" /></div>
                  ) : userBookings.length > 0 ? (
                      <div className="space-y-6">
                          <div className="grid gap-6">
                             {visibleBookings.map((booking) => (
                                 <TicketCard key={booking.id} booking={booking} onClick={setSelectedTicket} />
                             ))}
                          </div>
                          
                          {/* View All Toggle */}
                          {userBookings.length > 4 && (
                              <div className="text-center pt-4">
                                  <Link 
                                     to="/tickets"
                                     className="px-6 py-2 rounded-full border border-gray-300 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all inline-block"
                                  >
                                      View All ({userBookings.length})
                                  </Link>
                              </div>
                          )}
                      </div>
                  ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/5"
                      >
                          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎫</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Bookings Yet</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't booked any events yet.</p>
                          <Link to="/events" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all hover:scale-105">
                              Discover Events
                          </Link>
                      </motion.div>
                  )}
              </div>
           </div>
        </div>

        {/* Modals */}
        <PasswordChangeModal 
            isOpen={isPasswordModalOpen} 
            onClose={() => setIsPasswordModalOpen(false)} 
            onSubmit={handlePasswordChange}
        />
        
        {/* Ticket Preview Modal */}
        <TicketPreviewModal 
            isOpen={!!selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
            booking={selectedTicket} 
        />

        {/* Edit Profile Modal */}
        <Modal 
           isOpen={isEditProfileModalOpen} 
           onClose={() => setIsEditProfileModalOpen(false)} 
           title="Edit Profile"
        >
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Full Name</label>
                    <input 
                       type="text" name="name" value={userProfile.name} onChange={handleProfileInputChange} 
                       className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
                       placeholder="Jhon Doe"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
                    <input 
                       type="email" name="email" value={userProfile.email} onChange={handleProfileInputChange}
                       className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
                       placeholder="jhon@example.com"
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 font-bold transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all">
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
        
      </div>
    </>
  );
};

export default ProfilePage;
