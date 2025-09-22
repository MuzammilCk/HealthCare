import { Outlet, Link } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <div className="mb-4 text-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">HealthSync</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
