import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Tickets } from "./pages/Tickets";
import { LiveTracking } from "./pages/Tracking";
import { Technicians } from "./pages/Technicians";
import { TechnicianProfile } from "./pages/TechnicianProfile";
import { Customers } from "./pages/Customers";
import { CustomerDetails } from "./pages/CustomerDetails";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { SuperDashboard } from "./pages/super/SuperDashboard";
import { Tenants } from "./pages/super/Tenants";
import { Subscriptions } from "./pages/super/Subscriptions";
import { GlobalAnalytics } from "./pages/super/GlobalAnalytics";
import { ActivityLogs } from "./pages/super/ActivityLogs";
import { SupportCenter } from "./pages/super/SupportCenter";
import { SuperSettings } from "./pages/super/SuperSettings";
import { useAuthStore } from "./store/authStore";

export function RootRedirect() {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    console.log('[RootRedirect] Zustand store not hydrated yet. Showing loader...');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712] text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent shadow-lg shadow-sky-500/20"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  const isAuthed = isAuthenticated && !!token;

  console.log('[RootRedirect] Checking auth state - isAuthed:', isAuthed, '| user:', user?.username, '| role:', user?.role);

  if (!isAuthed || !user) {
    console.log('[RootRedirect] User is not authenticated. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toUpperCase();
  console.log('[RootRedirect] Redirecting authenticated user based on role:', role);
  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'SUPERVISOR' || role === 'MANAGER') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }

  console.warn('[RootRedirect] Unrecognized role:', role, '- Redirecting to /login');
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />
        
        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<ErrorBoundary><SuperDashboard /></ErrorBoundary>} />
            <Route path="tenants" element={<ErrorBoundary><Tenants /></ErrorBoundary>} />
            <Route path="subscriptions" element={<ErrorBoundary><Subscriptions /></ErrorBoundary>} />
            <Route path="analytics" element={<ErrorBoundary><GlobalAnalytics /></ErrorBoundary>} />
            <Route path="logs" element={<ErrorBoundary><ActivityLogs /></ErrorBoundary>} />
            <Route path="support" element={<ErrorBoundary><SupportCenter /></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary><SuperSettings /></ErrorBoundary>} />
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tracking" element={<ErrorBoundary><LiveTracking /></ErrorBoundary>} />
            <Route path="technicians" element={<Technicians />} />
            <Route path="technicians/:id" element={<TechnicianProfile />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<ErrorBoundary><CustomerDetails /></ErrorBoundary>} />
            <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
            <Route path="sla" element={<div>SLA Monitoring</div>} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="settings" element={<Settings />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Supervisor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'MANAGER']} />}>
          <Route path="/supervisor" element={<Layout />}>
            <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tracking" element={<ErrorBoundary><LiveTracking /></ErrorBoundary>} />
            <Route path="technicians" element={<Technicians />} />
            <Route path="technicians/:id" element={<TechnicianProfile />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<ErrorBoundary><CustomerDetails /></ErrorBoundary>} />
            <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
            <Route path="sla" element={<div>SLA Monitoring</div>} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="settings" element={<Settings />} />
            <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
