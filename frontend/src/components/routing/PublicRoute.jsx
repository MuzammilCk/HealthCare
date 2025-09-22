import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children || <Outlet />;
}
