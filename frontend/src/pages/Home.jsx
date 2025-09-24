import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page relative z-10">
      <div className="max-w-2xl text-center p-8">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">HealthSync</h1>
        <p className="text-lg mb-8 text-text-secondary">
          Unified healthcare management for appointments and prescriptions.
        </p>
        <div className="mt-4 space-x-4">
          {!user && (
            <>
              <Link to="/auth/login" className="inline-block bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 rounded-lg transition-transform transform hover:scale-105">
                Sign In
              </Link>
              <Link to="/auth/register" className="inline-block bg-bg-card text-text-primary font-bold px-8 py-3 rounded-lg transition-transform transform hover:scale-105">
                Register
              </Link>
            </>
          )}
          {user && (
            <Link to={`/${user.role}`} className="inline-block bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 rounded-lg transition-transform transform hover:scale-105">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}