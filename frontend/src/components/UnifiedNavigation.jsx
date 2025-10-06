import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ProfileButton from './ProfileButton';

export default function UnifiedNavigation() {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center justify-between bg-white dark:bg-bg-card-dark rounded-full px-6 py-3 shadow-lg border border-gray-100 dark:border-dark-border min-w-[600px] transition-colors duration-300">
        {/* Left side - Logo and Brand */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#1FA0FF] to-[#5EEBF7] text-white">
            <span className="font-bold text-xl">H</span>
          </div>
          
          {/* Application Name */}
          <h1 className="font-bold text-xl text-gray-800 dark:text-text-primary-dark">Health Syn</h1>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6 ml-8">
            <Link 
              to="/about" 
              className="text-gray-600 dark:text-text-secondary-dark hover:text-[#1FA0FF] dark:hover:text-[#5EEBF7] transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 dark:text-text-secondary-dark hover:text-[#1FA0FF] dark:hover:text-[#5EEBF7] transition-colors duration-200 font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right side - User Icons */}
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <ProfileButton />
        </div>
      </div>
    </div>
  );
}
