import { Outlet, Link } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative z-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-card p-6">
        <div className="mb-4 text-center">
          <Link to="/" className="text-2xl font-bold text-primary">HealthSync</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}