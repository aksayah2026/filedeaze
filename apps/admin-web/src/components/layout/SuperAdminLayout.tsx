import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Activity, 
  LifeBuoy, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin/dashboard" },
  { icon: Building2, label: "Tenants", path: "/super-admin/tenants" },
  { icon: CreditCard, label: "Subscriptions", path: "/super-admin/subscriptions" },
  { icon: BarChart3, label: "Analytics", path: "/super-admin/analytics" },
  { icon: Activity, label: "Activity Logs", path: "/super-admin/logs" },
  { icon: LifeBuoy, label: "Support Center", path: "/super-admin/support" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/super-admin/settings" },
];

export function SuperAdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#030712] text-slate-300 font-sans selection:bg-sky-500/30 overflow-hidden relative">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden w-full h-16 bg-[#030712] border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Super Admin</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-white/5 rounded-xl border border-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar navigation column */}
      <div className={cn(
        "w-72 flex flex-col h-full bg-[#030712] border-r border-white/5 z-50 fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Super Admin</h1>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">Platform</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/super-admin/dashboard');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-white bg-white/5" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="super-active-pill"
                      className="absolute left-0 w-1 h-5 bg-sky-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-sky-500" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">System</p>
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-white bg-white/5" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-sky-500" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Super'}`} alt="avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{user?.role || 'SUPER_ADMIN'}</p>
            </div>
            <button onClick={() => logout()} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#030712] p-6 md:p-8 pt-20 md:pt-8 transition-all">
         <Outlet />
      </div>
    </div>
  );
}
