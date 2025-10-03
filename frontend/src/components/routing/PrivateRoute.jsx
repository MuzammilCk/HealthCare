import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FullScreenLoader from '../ui/FullScreenLoader';

export default function PrivateRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader label="Loading your session…" />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children || <Outlet />;
}
