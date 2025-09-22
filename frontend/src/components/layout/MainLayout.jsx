import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function NavLink({ to, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} className={`block px-3 py-2 rounded text-sm font-medium ${active ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{label}</Link>
  );
}

export default function MainLayout({ role }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r p-4">
        <div className="text-xl font-bold text-blue-600 mb-4">HealthSync</div>
        <div className="space-y-2">
          <NavLink to={`/${role}`} label="Dashboard" />
          {role === 'patient' && (
            <>
              <NavLink to="/patient/medical-history" label="Medical History" />
              <NavLink to="/patient/appointments" label="Appointments" />
              <NavLink to="/patient/prescriptions" label="Prescriptions" />
              <NavLink to="/patient/book-appointment" label="Book Appointment" />
            </>
          )}
          {role === 'doctor' && (
            <>
              <NavLink to="/doctor/appointments" label="Appointments" />
              <NavLink to="/doctor/availability" label="Availability" />
              <NavLink to="/doctor/prescriptions/new" label="New Prescription" />
            </>
          )}
          {role === 'admin' && (
            <>
              <NavLink to="/admin/specializations" label="Specializations" />
            </>
          )}
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <div className="font-semibold text-gray-800">{user?.name}</div>
          <div className="truncate">{user?.email}</div>
          <div className="uppercase text-xs">{user?.role}</div>
          <button onClick={logout} className="mt-3 text-red-600 hover:underline">Logout</button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 p-4">
        <div className="md:hidden flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-blue-600">HealthSync</div>
          <button onClick={logout} className="text-sm text-red-600">Logout</button>
        </div>
        <div className="bg-white rounded shadow p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
