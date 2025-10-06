import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HoverNavBar() {
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative group" ref={menuRef}>
      {/* H Icon - Trigger */}
      <div 
        className="flex items-center justify-center px-5 py-3 rounded-full bg-gradient-to-br from-[#1FA0FF] to-[#5EEBF7] text-white border border-white/10 cursor-pointer transition-all duration-200 hover:scale-105"
        onMouseEnter={() => {
          clearTimeout(timeoutRef.current);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
        }}
      >
        <span className="font-semibold text-2xl">H</span>
      </div>

      {/* Single Row Navigation Bar - Appears on hover */}
      <div 
        className={`
          absolute left-full ml-4 top-1/2 -translate-y-1/2 min-w-[500px] w-auto bg-white dark:bg-bg-card-dark rounded-full px-10 py-4 shadow-lg dark:shadow-card-dark border border-gray-100 dark:border-dark-border overflow-hidden
          transition-all duration-300 ease-out z-50 flex items-center space-x-10
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
        `}
        onMouseEnter={() => {
          clearTimeout(timeoutRef.current);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
        }}
      >
        {/* Health Syn Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1FA0FF] to-[#5EEBF7] flex items-center justify-center">
            <span className="font-bold text-sm text-white">H</span>
          </div>
          <h2 className="font-bold text-lg text-gray-800 dark:text-text-primary-dark">HealthSync</h2>
        </div>
        
        {/* Navigation Links - Single Row */}
        <div className="flex items-center space-x-6">
          <Link 
            to="/about" 
            className="text-gray-600 dark:text-text-secondary-dark hover:text-[#1FA0FF] dark:hover:text-primary-light transition-colors duration-200 font-medium"
            onClick={() => setIsHovered(false)}
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-600 dark:text-text-secondary-dark hover:text-[#1FA0FF] dark:hover:text-primary-light transition-colors duration-200 font-medium"
            onClick={() => setIsHovered(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
