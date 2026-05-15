import { Search, Bell, Grid, Plus, HelpCircle, Command } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export function Topbar() {
  const { unreadCount } = useNotifications();

  return (
    <header className="h-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-40 flex items-center px-8 md:px-10 gap-8">
      {/* Search Bar */}
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search documentation, tickets, or technicians..."
          className="w-full max-w-xl bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-12 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-500 font-bold">
          <Command className="w-3 h-3" />
          K
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 transition-all relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-sky-500 text-[8px] font-bold text-white rounded-full border border-[#020617] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 transition-all">
            <Grid className="w-5 h-5" />
          </button>
          <button className="hidden sm:flex p-2.5 rounded-xl hover:bg-white/5 text-slate-400 transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <button className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 active:scale-[0.98] transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>
    </header>
  );
}
