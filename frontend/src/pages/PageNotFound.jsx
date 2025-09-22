import { Link } from 'react-router-dom';
export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">The page you are looking for doesn’t exist.</p>
        <Link to="/" className="text-blue-600 underline">Go Home</Link>
      </div>
    </div>
  );
}
