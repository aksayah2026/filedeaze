import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore();

  // Dual check: Zustand state AND localStorage token
  const localToken = localStorage.getItem('token');
  const isAuthed = isAuthenticated && (!!token || !!localToken);

  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated, '| token exists:', !!token || !!localToken, '| user role:', user?.role);

  if (!isAuthed) {
    console.log('[ProtectedRoute] Not authenticated — redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userRole = user.role?.toUpperCase() as UserRole;
    const hasAccess = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    if (!hasAccess) {
      console.warn('[ProtectedRoute] Role not allowed:', userRole, '| allowed:', allowedRoles);
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
