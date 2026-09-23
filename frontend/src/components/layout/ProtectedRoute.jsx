import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RoleRoute = ({ roles }) => {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(...roles)) return <Navigate to="/" replace />;
  return <Outlet />;
};
