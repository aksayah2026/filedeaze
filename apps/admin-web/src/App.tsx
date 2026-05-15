import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Tickets } from "./pages/Tickets";
import { LiveTracking } from "./pages/Tracking";
import { Technicians } from "./pages/Technicians";
import { Customers } from "./pages/Customers";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tracking" element={<LiveTracking />} />
            <Route path="technicians" element={<Technicians />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="sla" element={<div>SLA Monitoring</div>} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="roles" element={<div>Role Management</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
