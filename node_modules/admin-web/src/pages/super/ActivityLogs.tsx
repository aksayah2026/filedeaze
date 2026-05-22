import { useState, useEffect } from "react";
import { 
  Info, AlertTriangle, CheckCircle, Terminal, Search, Filter, 
  Loader2, RefreshCw, ChevronLeft, ChevronRight 
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";

export function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchLogs = async (page = 0) => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        size: pageSize,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (levelFilter !== "ALL") {
        params.action = levelFilter; // Maps level filter to action parameter or search
      }

      const res = await superAdminService.getActivityLogs(params);
      if (res.success && res.data) {
        // Handle Spring Page object
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
        setCurrentPage(res.data.number || 0);
      }
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [levelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(0);
  };

  const getLevelBadge = (level: string) => {
    const cleanLevel = (level || "INFO").toUpperCase();
    switch (cleanLevel) {
      case "ERROR":
      case "DELETE":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase"><AlertTriangle className="w-3 h-3" />Error</span>;
      case "WARNING":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase"><AlertTriangle className="w-3 h-3" />Warning</span>;
      case "SUCCESS":
      case "CREATE":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase"><CheckCircle className="w-3 h-3" />Success</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase"><Info className="w-3 h-3" />Info</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-8 h-8 text-sky-500" />
            Audit Logs & Activity
          </h2>
          <p className="text-slate-400 mt-1">Real-time system events, transaction logs, and tenant interaction audits.</p>
        </div>
        
        <button 
          onClick={() => fetchLogs(currentPage)}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all self-end sm:self-auto"
          title="Refresh console stream"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : ""}`} />
        </button>
      </div>

      {/* Filters Area */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs by keyword, tenant UUID, or action and press Enter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-black/35 border border-white/10 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-sky-500/50"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletes</option>
            <option value="LOGIN">Logins</option>
          </select>
        </div>
      </form>

      {/* Terminal audit console logs list */}
      <div className="bg-[#080b12] border border-white/5 rounded-2xl overflow-hidden font-mono shadow-2xl">
        
        {/* Console Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-slate-300">Auditor Stream Console</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live listening...
          </span>
        </div>

        {/* Console Logs */}
        <div className="divide-y divide-white/[0.02]">
          {isLoading ? (
            <div className="p-20 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              <span>Decoding binary audit payload...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No matching activity events found in the database.
            </div>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} className="p-4 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row gap-3 md:items-center text-xs">
                <div className="w-24 shrink-0 font-bold">{getLevelBadge(log.action)}</div>
                <div className="w-32 shrink-0 text-slate-500 font-bold truncate">[{log.module || "SYSTEM"}]</div>
                <div className="flex-1 text-slate-300 min-w-0 pr-4 break-words">
                  {log.description}
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 mt-2 md:mt-0">
                  <span className="px-2.5 py-0.5 bg-white/5 text-slate-400 rounded text-[10px] font-bold select-all font-mono">
                    {log.tenantId === "SYSTEM" ? "System" : `Tenant:${log.tenantId?.substring(0, 8)}...`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Console Footer Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="bg-slate-950/40 px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold font-mono text-[10px]">
              TOTAL EVENTS: {totalElements}
            </span>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-1 hover:bg-white/5 border border-white/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold font-mono text-[10px]">
                PAGE {currentPage + 1} OF {totalPages}
              </span>
              <button
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-1 hover:bg-white/5 border border-white/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
