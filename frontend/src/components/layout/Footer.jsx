import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white relative overflow-hidden pt-24 pb-12">
      {/* Massive Background Watermark */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <h1 className="text-[20vw] font-black text-white leading-none whitespace-nowrap absolute -top-20 -left-10">
          EventHub
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
                EventHub
              </span>
            </Link>
            <p className="mt-6 text-gray-400 max-w-sm text-lg font-light leading-relaxed">
              Curating the extraordinary. We connect you to the heartbeat of the city 
              through immersive experiences and unforgettable moments.
            </p>
            
            <div className="flex gap-4 mt-8">
               {['twitter', 'instagram', 'linkedin', 'facebook'].map((social) => (
                 <a 
                   key={social} 
                   href="#" 
                   className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                 >
                    <span className="sr-only">{social}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z"/>
                    </svg>
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-indigo-500 tracking-widest uppercase mb-6">
              Discover
            </h3>
            <ul className="space-y-4">
              {['Features', 'Events', 'Live', 'Community'].map((item) => (
                <li key={item}>
                  <Link
                    to="/events"
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-indigo-500 tracking-widest uppercase mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Legal', 'Privacy'].map((item) => (
                <li key={item}>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} EventHub Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
             <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
