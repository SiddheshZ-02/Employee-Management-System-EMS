import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { type UserRole } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    let redirectPath = '/employee/dashboard';
    if (user.role === 'Admin') {
      redirectPath = '/admin/dashboard';
    } else if (user.role === 'Owner') {
      redirectPath = '/owner/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
