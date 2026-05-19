import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  UserSquare2, 
  BarChart3, 
  Map, 
  Settings, 
  Bell, 
  ShieldCheck,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Ticket, label: "Tickets", path: "/tickets" },
  { icon: UserSquare2, label: "Technicians", path: "/technicians" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Map, label: "Live Tracking", path: "/tracking" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

import { useAuthStore } from "@/store/authStore";

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="w-72 flex flex-col h-full bg-[#030712] border-r border-white/5 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">FieldEaze</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                  isActive 
                    ? "text-white bg-white/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
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
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">Administration</p>
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Felix'}`} alt="avatar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin User'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{user?.role || 'Super Admin'}</p>
          </div>
          <button onClick={() => logout()} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
