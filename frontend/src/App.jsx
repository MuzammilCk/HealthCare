import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl text-center p-6">
        <h1 className="text-4xl font-extrabold mb-3">HealthSync</h1>
        <p className="text-gray-600 mb-6">Welcome to HealthSync.</p>
        <div className="mt-4 space-x-3">
          <Link to="/auth/login" className="inline-block bg-blue-500 text-white px-6 py-3 rounded">Sign In</Link>
          <Link to="/auth/register" className="inline-block bg-white border px-6 py-3 rounded">Register</Link>
          <Link to="/patient" className="inline-block bg-gray-100 border px-6 py-3 rounded">Patient Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
