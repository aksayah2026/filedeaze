import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 selection:bg-sky-500/30">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
