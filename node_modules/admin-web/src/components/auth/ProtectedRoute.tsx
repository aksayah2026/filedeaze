import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[JWT Parser] Failed to parse token payload:', e);
    return null;
  }
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, token, isHydrated, logout } = useAuthStore();

  // 1. Session Hydration / Restore check
  if (!isHydrated) {
    console.log('[ProtectedRoute] Zustand store not hydrated yet. Showing loader...');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712] text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent shadow-lg shadow-sky-500/20"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  // Dual check: Zustand state AND localStorage token
  const localToken = localStorage.getItem('token');
  const tokenToUse = token || localToken;
  const isAuthed = isAuthenticated && !!tokenToUse;

  // Decoded payload validation — JWT is the source of truth for role and tenantId
  let decoded: any = null;
  if (tokenToUse) {
    decoded = parseJwt(tokenToUse);
  }

  // DEBUG LOGS
  console.log('=== [ProtectedRoute SESSION LIFECYCLE DEBUG START] ===');
  console.log('[ProtectedRoute Debug] Token present in Store:', !!token);
  console.log('[ProtectedRoute Debug] Token present in LocalStorage:', !!localToken);
  console.log('[ProtectedRoute Debug] isAuthenticated flag:', isAuthenticated);
  console.log('[ProtectedRoute Debug] Computed Auth Status (isAuthed):', isAuthed);
  if (decoded) {
    console.log('[ProtectedRoute Debug] Decoded JWT Payload:', decoded);
    console.log('[ProtectedRoute Debug] JWT Expiry (exp):', decoded.exp);
    console.log('[ProtectedRoute Debug] Current Epoch Time (seconds):', Date.now() / 1000);
    console.log('[ProtectedRoute Debug] JWT Expiry compared to Current Time:', decoded.exp ? decoded.exp * 1000 : 'N/A', 'vs', Date.now());
  }
  if (user) {
    console.log('[ProtectedRoute Debug] Hydrated User:', user);
    console.log('[ProtectedRoute Debug] User session in Store:', user.username);
    console.log('[ProtectedRoute Debug] Role detected:', user.role);
    console.log('[ProtectedRoute Debug] Tenant ID in Store:', user.tenantId);
  }
  console.log('=== [ProtectedRoute SESSION LIFECYCLE DEBUG END] ===');

  // 2. Auth State Validation
  if (!isAuthed) {
    console.log('[ProtectedRoute] Access Denied: Not authenticated. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // 3. JWT Expiry Check
  if (decoded && decoded.exp) {
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      console.warn('[ProtectedRoute] Session Expired! Token exp exceeded current date.');
      console.trace('[ProtectedRoute Trace] LOGOUT TRIGGERED: Token Expiration Validation Failed');
      logout();
      return <Navigate to="/login" replace />;
    }
  }

  // 4. Tenant Validation & SUPER_ADMIN Bypass
  // CRITICAL FIX: Use JWT decoded tenantId as primary source of truth (not stale store user).
  // CRITICAL FIX: On tenant failure, do NOT call logout() which triggers window.location.href
  // and causes a full-page-reload loop. Instead, clear state directly and use React Router Navigate.
  if (user) {
    const userRole = user.role?.toUpperCase();
    const jwtRole = decoded?.role?.toUpperCase();
    const finalRole = jwtRole || userRole;
    // Prefer JWT decoded tenantId (most up-to-date); fallback to persisted store user.tenantId
    const rawTenantId = decoded?.tenantId ?? user.tenantId;
    const tenantIdStr = rawTenantId != null ? String(rawTenantId) : '';
    const tenantId = (tenantIdStr && tenantIdStr !== 'null' && tenantIdStr !== 'undefined') ? tenantIdStr : null;

    const normalizedRole = finalRole?.trim()?.toUpperCase();
    console.log('[ProtectedRoute Tenant Check] normalizedRole:', normalizedRole, '| tenantId:', tenantId);

    if (normalizedRole === 'SUPER_ADMIN') {
      console.log('[ProtectedRoute Tenant Check] SUPER_ADMIN bypasses tenant validation');
    } else if (['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CUSTOMER'].includes(normalizedRole)) {
      if (!tenantId) {
        console.error('[ProtectedRoute Tenant Check] Non-super admin missing tenantId! Clearing session safely.');
        console.trace('[ProtectedRoute Trace] SESSION CLEARED: Tenant Validation Failed — no tenantId in JWT');
        // Safe clear: avoid window.location.href (breaks React Router, causes reload loop).
        // Directly mutate Zustand state and use React Router Navigate instead.
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        useAuthStore.setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        return <Navigate to="/login" replace />;
      }
    } else {
      if (!tenantId) {
        console.error('[ProtectedRoute Tenant Check] Unknown role missing tenantId!');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        useAuthStore.setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        return <Navigate to="/login" replace />;
      }
    }
  }

  // 5. Role-based Route Authorization
  if (allowedRoles && user) {
    const userRole = user.role?.toUpperCase() as UserRole;
    const hasAccess = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    
    if (!hasAccess) {
      console.warn('[ProtectedRoute Redirect Logic] Access Denied: User role:', userRole, 'not in allowed list:', allowedRoles);
      
      if (userRole === 'SUPER_ADMIN') {
        console.log('[ProtectedRoute Redirect Logic] Redirecting SUPER_ADMIN to /super-admin/dashboard');
        return <Navigate to="/super-admin/dashboard" replace />;
      } else if (userRole === 'ADMIN') {
        console.log('[ProtectedRoute Redirect Logic] Redirecting ADMIN to /admin/dashboard');
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'SUPERVISOR' || userRole === 'MANAGER') {
        console.log('[ProtectedRoute Redirect Logic] Redirecting SUPERVISOR to /supervisor/dashboard');
        return <Navigate to="/supervisor/dashboard" replace />;
      }
      
      console.log('[ProtectedRoute Redirect Logic] Redirecting unrecognized role to /login');
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
