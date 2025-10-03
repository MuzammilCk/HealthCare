import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FullScreenLoader from '../ui/FullScreenLoader';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader label="Preparing experience…" />;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children || <Outlet />;
}
