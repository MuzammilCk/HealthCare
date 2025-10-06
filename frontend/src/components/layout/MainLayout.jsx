import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useState } from 'react';
import ProfileButton from '../ProfileButton';
import NotificationBell from '../NotificationBell';
import HoverNavBar from '../HoverNavBar';
import ThemeToggle from '../ThemeToggle';

function NavLink({ to, label, isSidebarOpen, icon, showNotificationDot = false }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} className={`group relative flex items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-200 ${
      active
        ? 'bg-white/15 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`}>
      <span className={`${active ? 'text-white' : ''} flex-shrink-0 relative`}>
        {icon}
        {showNotificationDot && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </span>
      {/* Tooltip label - high z-index, only on hover */}
      <span className={`
        pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 
        whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white 
        bg-slate-900/90 shadow-xl border border-white/10 
        opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 
        transition-all duration-200 z-[9999]
      `}>{label}</span>
    </Link>
  );
}

function NavigationLinks({ role, isSidebarOpen }) {
  const { unreadKycCount } = useNotifications();
  const iconProps = {
    className: "h-6 w-6",
  };
  return (
    <div className="space-y-2">
      <NavLink
        to={`/${role}`}
        label="Dashboard"
        isSidebarOpen={isSidebarOpen}
        icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
      />
      {role === 'patient' && (
        <>
          <NavLink to="/patient/symptom-checker" label="Symptom Checker" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} />
          <NavLink to="/patient/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/patient/prescriptions" label="Prescriptions" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavLink to="/patient/medical-history" label="Medical History" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13V11m0 0h-2m2 0h2m-2-2v-2m0 2v2m-2 2h-2m2 0h2m-2 2v2m0-2v-2" /></svg>} />
          <NavLink to="/patient/bills" label="Bills & Payments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
          <NavLink to="/patient/book-appointment" label="Book Appointment" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} />
        </>
      )}
      {role === 'doctor' && (
        <>
          <NavLink to="/doctor/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/doctor/availability" label="Availability" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavLink to="/doctor/patient-file" label="Patient Files" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>} />
          <NavLink to="/doctor/settings" label="Settings" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <NavLink to="/doctor/kyc" label="KYC Verification" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.53 0 1.04-.21 1.41-.59.38-.38.59-.88.59-1.41 0-.53-.21-1.04-.59-1.41A1.99 1.99 0 0012 7c-.53 0-1.04.21-1.41.59-.38.37-.59.88-.59 1.41 0 .53.21 1.03.59 1.41.37.38.88.59 1.41.59zm0 2c-1.33 0-2.6.53-3.54 1.46C7.53 15.4 7 16.67 7 18h10c0-1.33-.53-2.6-1.46-3.54A5 5 0 0012 13z" /></svg>} />
        </>
      )}
      {role === 'admin' && (
        <>
          <NavLink to="/admin/specializations" label="Specializations" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 14h.01M7 11h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>} />
          <NavLink 
            to="/admin/kyc-requests" 
            label="KYC Requests" 
            isSidebarOpen={isSidebarOpen} 
            showNotificationDot={unreadKycCount > 0}
            icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m2-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          />
          <NavLink to="/admin/doctors" label="Manage Doctors" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m10-6a4 4 0 11-8 0 4 4 0 018 0zM9 8a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
          <NavLink to="/admin/hospitals" label="Manage Hospitals" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
          <NavLink to="/admin/inventory" label="Manage Inventory" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        </>
      )}
    </div>
  );
}

export default function MainLayout({ role: roleProp }) {
  const { user } = useAuth();
  const role = roleProp || user?.role;
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-page dark:bg-bg-page-dark transition-colors duration-300">
      {/* Theme Toggle and Notification - fixed top-right */}
      <div className="fixed top-4 right-6 z-50 flex items-center space-x-3">
        <ThemeToggle />
        <NotificationBell />
      </div>

      {/* Single fixed left column with space-around alignment for brand, sidebar, profile */}
      <div className="hidden md:flex fixed left-6 top-0 bottom-0 z-40 flex-col items-center justify-around py-4">
        {/* Brand pill with hover navigation */}
        <HoverNavBar />

        {/* Sidebar (not containing brand/profile) */}
        <aside className={`flex bg-gradient-to-br from-[#1FA0FF] to-[#5EEBF7] text-white rounded-3xl px-3 py-4 items-center justify-center transition-all duration-300 ${isSidebarOpen ? 'w-24' : 'w-20'}`}>
          <div className="flex flex-col items-center justify-center space-y-3">
            <NavigationLinks role={role} isSidebarOpen={false} />
          </div>
        </aside>

        {/* Profile icon - remove gradient ring wrapper */}
        <div className="rounded-full">
          <ProfileButton />
        </div>
      </div>

      {/* Main Content Area with Dynamic Margin and top padding for nav */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 md:ml-28 pt-10`}>
        {/* Constrained Content Area with Better Spacing */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-bg-card-dark rounded-2xl p-6 lg:p-8 relative z-10 shadow-card dark:shadow-card-dark transition-colors duration-300">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
