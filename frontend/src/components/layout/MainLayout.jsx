import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import CardNav from '../CardNav';

function NavLink({ to, label, isSidebarOpen, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} className={`flex items-center ${isSidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25 scale-105' 
        : 'text-text-secondary hover:bg-white/10 hover:text-text-primary hover:shadow-md hover:scale-105'
    }`}>
      <span className={`${active ? 'text-white' : ''} flex-shrink-0`}>{icon}</span>
      <span className={`ml-3 whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>{label}</span>
    </Link>
  );
}

function NavigationLinks({ role, isSidebarOpen }) {
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
          <NavLink to="/patient/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/patient/prescriptions" label="Prescriptions" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavLink to="/patient/medical-history" label="Medical History" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13V11m0 0h-2m2 0h2m-2-2v-2m0 2v2m-2 2h-2m2 0h2m-2 2v2m0-2v-2" /></svg>} />
          <NavLink to="/patient/book-appointment" label="Book Appointment" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} />
        </>
      )}
      {role === 'doctor' && (
        <>
          <NavLink to="/doctor/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/doctor/availability" label="Availability" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavLink to="/doctor/prescriptions/new" label="New Prescription" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavLink to="/doctor/kyc" label="KYC Verification" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.53 0 1.04-.21 1.41-.59.38-.38.59-.88.59-1.41 0-.53-.21-1.04-.59-1.41A1.99 1.99 0 0012 7c-.53 0-1.04.21-1.41.59-.38.37-.59.88-.59 1.41 0 .53.21 1.03.59 1.41.37.38.88.59 1.41.59zm0 2c-1.33 0-2.6.53-3.54 1.46C7.53 15.4 7 16.67 7 18h10c0-1.33-.53-2.6-1.46-3.54A5 5 0 0012 13z" /></svg>} />
        </>
      )}
      {role === 'admin' && (
        <>
          <NavLink to="/admin/specializations" label="Specializations" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 14h.01M7 11h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>} />
          <NavLink to="/admin/kyc-requests" label="KYC Requests" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m2-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavLink to="/admin/doctors" label="Manage Doctors" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m10-6a4 4 0 11-8 0 4 4 0 018 0zM9 8a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        </>
      )}
    </div>
  );
}

export default function MainLayout({ role: roleProp }) {
  const { user } = useAuth();
  const role = roleProp || user?.role;
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fixed Sidebar with Overlay Positioning */}
      <aside className={`hidden md:flex md:flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl shadow-slate-900/5 p-6 transition-all duration-300 fixed inset-y-0 left-0 z-30 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="flex items-center justify-between mb-8 h-[60px]">
          <span className={`font-bold text-xl text-slate-800 ${!isSidebarOpen && 'hidden'}`}>HealthCare</span>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-600 transition-transform duration-300 ${isSidebarOpen ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <NavigationLinks role={role} isSidebarOpen={isSidebarOpen} />
      </aside>

      {/* Main Content Area with Dynamic Margin */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'}`}>
        {/* Clean Header without Background */}
        <div className="relative z-40">
          <CardNav />
        </div>
        
        {/* Constrained Content Area with Better Spacing */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-900/5 p-6 lg:p-8 relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}