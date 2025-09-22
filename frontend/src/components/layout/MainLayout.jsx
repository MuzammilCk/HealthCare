import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

function NavLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`block px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-primary text-white' : 'text-medium-gray hover:bg-light-gray'}`}>{label}</Link>
  );
}

// A component for the navigation links to avoid repetition
function NavigationLinks({ role, onLinkClick }) {
  return (
    <div className="space-y-2">
      <NavLink to={`/${role}`} label="Dashboard" onClick={onLinkClick} />
      {role === 'patient' && (
        <>
          <NavLink to="/patient/medical-history" label="Medical History" onClick={onLinkClick} />
          <NavLink to="/patient/appointments" label="Appointments" onClick={onLinkClick} />
          <NavLink to="/patient/prescriptions" label="Prescriptions" onClick={onLinkClick} />
          <NavLink to="/patient/book-appointment" label="Book Appointment" onClick={onLinkClick} />
        </>
      )}
      {role === 'doctor' && (
        <>
          <NavLink to="/doctor/appointments" label="Appointments" onClick={onLinkClick} />
          <NavLink to="/doctor/availability" label="Availability" onClick={onLinkClick} />
          <NavLink to="/doctor/prescriptions/new" label="New Prescription" onClick={onLinkClick} />
        </>
      )}
      {role === 'admin' && (
        <>
          <NavLink to="/admin/specializations" label="Specializations" onClick={onLinkClick} />
        </>
      )}
    </div>
  )
}

export default function MainLayout({ role }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-light-gray">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r p-4">
        <div>
          <div className="text-2xl font-bold text-primary mb-4">HealthSync</div>
          <NavigationLinks role={role} />
        </div>
        <div className="flex-grow" />
        <div className="text-sm text-medium-gray">
          <div className="font-semibold text-dark-charcoal">{user?.name}</div>
          <div className="truncate">{user?.email}</div>
          <div className="uppercase text-xs">{user?.role}</div>
          <button onClick={logout} className="mt-3 text-error hover:underline">Logout</button>
        </div>
      </aside>
      
      {/* --- Main Content --- */}
      <main className="flex-1 p-4" style={{ maxWidth: '1200px' }}>
        {/* --- Mobile Header --- */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-primary">HealthSync</div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <Outlet />
        </div>
      </main>

      {/* --- Mobile Menu --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-primary">HealthSync</div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-grow">
            <NavigationLinks role={role} onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
          <div className="text-sm text-medium-gray">
            <div className="font-semibold text-dark-charcoal">{user?.name}</div>
            <div className="truncate">{user?.email}</div>
            <div className="uppercase text-xs">{user?.role}</div>
            <button onClick={logout} className="mt-3 text-error hover:underline">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}