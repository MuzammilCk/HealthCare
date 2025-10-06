import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoBackground from '../components/VideoBackground';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page dark:bg-bg-page-dark relative z-10 transition-colors duration-300">
      <VideoBackground />
      <div className="max-w-2xl text-center p-8">
        <h1 className="text-5xl font-extrabold mb-4 text-primary dark:text-primary-light">HealthSync</h1>
        <p className="text-lg mb-8 text-text-secondary dark:text-text-secondary-dark">
          Unified healthcare management for appointments and prescriptions.
        </p>
        <div className="mt-4 space-x-4">
          {!user && (
            <>
              <Link to="/auth/login" className="inline-block bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 rounded-lg transition-transform transform hover:scale-105">
                Sign In
              </Link>
              <Link to="/auth/register" className="inline-block bg-white dark:bg-bg-card-dark text-text-primary dark:text-text-primary-dark font-bold px-8 py-3 rounded-lg border border-gray-300 dark:border-dark-border transition-transform transform hover:scale-105">
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