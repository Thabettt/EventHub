import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// This component now returns both the sidebar AND a wrapper for content
const OrganizerSidebar = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Check window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Standardized navigation items with consistent icon paths
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/organizer/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      name: 'Events', 
      href: '/organizer/events', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'from-purple-400 to-purple-600'
    },
    { 
      name: 'Analytics', 
      href: '/organizer/analytics', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'from-green-400 to-green-600'
    },
    { 
      name: 'Attendees', 
      href: '/organizer/attendees', 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'from-amber-400 to-amber-600'
    },
    { 
      name: 'Messages', 
      href: '/organizer/messages', 
      icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      color: 'from-pink-400 to-pink-600'
    },
    { 
      name: 'Settings', 
      href: '/organizer/settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      color: 'from-gray-400 to-gray-600'
    },
  ];
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu toggle button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
        >
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        className={`h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Mobile backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar content */}
        <div className="h-full bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white flex flex-col shadow-xl relative z-40">
          {/* Collapse toggle button - desktop only */}
          {/* Collapse toggle button - better positioning and clearer direction indication */}
          {/* Collapse toggle button - fixed positioning and z-index */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:flex absolute -right-3 top-24 bg-white text-indigo-600 hover:text-indigo-800 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 z-50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
          
          {/* Top spacing */}
          <div className="h-8"></div>

          {/* Navigation */}
          <div className="flex-grow px-4 py-2 overflow-y-auto custom-scrollbar">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                
                return (
                    <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center transition-all duration-200
                      ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                      py-3 rounded-xl
                      ${active 
                        ? 'text-indigo-800 shadow-sm' /* Removed bg-white here */
                        : 'text-indigo-100 hover:bg-white/10'}
                    `}
                  >
                    {/* Icon with gradient background when active (both collapsed and expanded) */}
                    <div className={`
                      relative flex-shrink-0 flex items-center justify-center rounded-lg
                      ${isCollapsed 
                        ? 'w-10 h-10' 
                        : 'w-10 h-10'}
                      ${active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                        : 'text-indigo-300 group-hover:text-white'}
                      transition-all duration-300 ease-in-out
                    `}>
                      <svg
                        className={`
                          transition-all duration-300 ease-in-out
                          ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                        `}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2"
                      >
                        <path d={item.icon} />
                      </svg>
                    </div>
                    
                    {/* Label - hidden when collapsed */}
                    {!isCollapsed && (
                      <span className={`
                        ml-3 font-medium transition-opacity duration-300
                        ${active ? 'text-white font-semibold' : 'text-indigo-100'}
                      `}>
                        {item.name}
                      </span>
                    )}
                    
                    {/* Active indicator */}
                    {active && !isCollapsed && (
                      <span className="absolute inset-y-0 right-0 w-1 bg-indigo-600 rounded-l-md"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Support section */}
            {!isCollapsed && (
              <div className="mt-6">
                <div className="px-3 py-3 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Support
                </div>
                <a
                  href="#"
                  className="flex items-center px-3 py-3 rounded-xl text-indigo-100 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-indigo-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium">Help Center</span>
                </a>
                
                <a
                  href="#"
                  className="flex items-center px-3 py-3 rounded-xl text-indigo-100 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-indigo-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium">Contact Us</span>
                </a>
              </div>
            )}
          </div>
          
          {/* User profile and logout */}
          <div className={`p-6 border-t border-indigo-800/60 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold uppercase">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold uppercase">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white truncate max-w-[180px]">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-xs text-indigo-300">Organizer</div>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg text-white transition-colors shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default OrganizerSidebar;