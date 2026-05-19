import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
