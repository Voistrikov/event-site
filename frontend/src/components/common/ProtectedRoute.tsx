import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import type { Role } from '../../types/user.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isInitialized, isAuthenticated } = useAuth();

  // Wait for the store to rehydrate before making any redirect decision
  if (!isInitialized) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Users whose registration is pending cannot access protected features
  if (user?.status === 'PENDING') return <Navigate to="/pending-approval" replace />;

  // Rejected users are sent back to login
  if (user?.status === 'REJECTED') return <Navigate to="/login" replace />;

  // Role-gated routes
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

