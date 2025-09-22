import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl text-center p-6">
        <h1 className="text-4xl font-extrabold mb-3">HealthSync</h1>
        <p className="text-gray-600 mb-6">Unified healthcare management for appointments and prescriptions.</p>
        <div className="mt-4 space-x-3">
          {!user && (
            <>
              <Link to="/auth/login" className="inline-block bg-blue-500 text-white px-6 py-3 rounded">Sign In</Link>
              <Link to="/auth/register" className="inline-block bg-white border px-6 py-3 rounded">Register</Link>
            </>
          )}
          {user && (
            <Link to={`/${user.role}`} className="inline-block bg-blue-500 text-white px-6 py-3 rounded">Go to Dashboard</Link>
          )}
        </div>
      </div>
    </div>
  );
}
