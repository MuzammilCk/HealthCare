import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import CardNav from '../CardNav';

function NavLink({ to, label, isSidebarOpen, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-text-primary'}`}>
      {icon}
      <span className={`ml-3 ${!isSidebarOpen && 'hidden'}`}>{label}</span>
    </Link>
  );
}

function NavigationLinks({ role, isSidebarOpen }) {
    const iconProps = {
    className: "h-6 w-6"
  }
  return (
    <div className="space-y-2">
      <NavLink to={`/${role}`} label="Dashboard" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
      {role === 'patient' && (
        <>
          <NavLink to="/patient/medical-history" label="Medical History" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13V12a2 2 0 00-2-2H9a2 2 0 00-2 2v8m4-13.5V6.5m0 0V4a2 2 0 10-4 0v2.5m4 0H7" /></svg>} />
          <NavLink to="/patient/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/patient/prescriptions" label="Prescriptions" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavLink to="/patient/book-appointment" label="Book Appointment" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} />
        </>
      )}
      {role === 'doctor' && (
        <>
          <NavLink to="/doctor/appointments" label="Appointments" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavLink to="/doctor/availability" label="Availability" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavLink to="/doctor/prescriptions/new" label="New Prescription" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        </>
      )}
      {role === 'admin' && (
        <>
          <NavLink to="/admin/specializations" label="Specializations" isSidebarOpen={isSidebarOpen} icon={<svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 14h.01M7 11h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>} />
        </>
      )}
    </div>
  )
}

export default function MainLayout({ role: roleProp }) {
  const { user } = useAuth();
  const role = roleProp || user?.role;
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-bg-page">
      <aside className={`hidden md:flex md:flex-col bg-bg-card/80 backdrop-blur-xl border-r border-white/20 p-4 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-end mb-6 h-[60px]">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isSidebarOpen ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <NavigationLinks role={role} isSidebarOpen={isSidebarOpen} />
      </aside>

      <div className="flex-1 flex flex-col w-full">
        <CardNav />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="bg-bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-card p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}