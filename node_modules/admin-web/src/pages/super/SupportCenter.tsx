import { useState, useEffect } from "react";
import { 
  LifeBuoy, Search, Filter, Plus, CheckCircle2, AlertCircle, Clock, 
  Loader2, RefreshCw, X, AlertTriangle, HelpCircle, ChevronRight, Check
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import { motion, AnimatePresence } from "framer-motion";

export function SupportCenter() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [companyName, setCompanyName] = useState("");
  const [tenantId, setTenantId] = useState("");

  // Selected Ticket detail drawer/modal
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getSupportTickets();
      if (res.success) {
        setTickets(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch support tickets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenCreate = () => {
    setSubject("");
    setDescription("");
    setSeverity("MEDIUM");
    setCompanyName("");
    setTenantId("");
    setErrorMsg("");
    setIsCreateOpen(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !companyName.trim() || !tenantId.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        tenantId,
        companyName,
        subject,
        description,
        severity,
        status: "OPEN"
      };
      const res = await superAdminService.createSupportTicket(payload);
      if (res.success) {
        setIsCreateOpen(false);
        fetchTickets();
      } else {
        setErrorMsg(res.message || "Failed to create support ticket");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, nextStatus: string) => {
    try {
      const res = await superAdminService.updateSupportTicketStatus(ticketId, nextStatus);
      if (res.success) {
        // Refresh local details if selected
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: nextStatus });
        }
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || t.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Calculate ticket counts
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const progressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">CRITICAL</span>;
      case "HIGH":
        return <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">HIGH</span>;
      case "MEDIUM":
        return <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20">MEDIUM</span>;
      default:
        return <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-500/10 text-slate-400 border border-slate-500/20">LOW</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-8 h-8 text-sky-500" />
            Support Center
          </h2>
          <p className="text-slate-400 mt-1">Audit and resolve technical assistance tickets filed by corporate tenant organizations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTickets}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : ""}`} />
          </button>
          
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 font-bold text-sm select-none"
          >
            <Plus className="w-4 h-4" />
            Log Ticket
          </button>
        </div>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-500/[0.04] to-transparent border border-rose-500/10 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Open Tickets</p>
            <h3 className="text-3xl font-extrabold text-white font-mono mt-1">{isLoading ? "--" : openCount}</h3>
          </div>
          <AlertCircle className="w-10 h-10 text-rose-500/30" />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/[0.04] to-transparent border border-amber-500/10 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
            <h3 className="text-3xl font-extrabold text-white font-mono mt-1">{isLoading ? "--" : progressCount}</h3>
          </div>
          <Clock className="w-10 h-10 text-amber-500/30 animate-pulse" />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-500/[0.04] to-transparent border border-emerald-500/10 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Resolved Cases</p>
            <h3 className="text-3xl font-extrabold text-white font-mono mt-1">{isLoading ? "--" : resolvedCount}</h3>
          </div>
          <CheckCircle2 className="w-10 h-10 text-emerald-500/30" />
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tickets by subject, corporate client, or UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/35 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-sky-500/50"
            >
              <option value="ALL">All States</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-xs text-slate-500 font-bold uppercase shrink-0">Severity:</span>
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-black/35 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-sky-500/50"
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main List Layout */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Tuning support transceivers...</p>
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <LifeBuoy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-lg">No support cases found</p>
          <p className="text-slate-500 text-sm mt-1">Hooray! No client organizations are reporting any system issues currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Roster Cards Column */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTickets.map((t) => (
              <div 
                key={t.ticketId}
                onClick={() => setSelectedTicket(t)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedTicket?.ticketId === t.ticketId 
                    ? "bg-sky-500/[0.04] border-sky-500/40 shadow-lg shadow-sky-500/5" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">{getStatusIcon(t.status)}</div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm hover:text-sky-400 transition-colors truncate">
                      {t.subject}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs mt-1.5 text-slate-500">
                      <span className="font-semibold text-slate-300">{t.companyName}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] select-all">UUID: {t.tenantId?.substring(0, 8)}...</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {getSeverityBadge(t.severity)}
                  <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>

          {/* Details Column / State panel */}
          <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl relative sticky top-6">
            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  key={selectedTicket.ticketId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ticket Details</span>
                      <h3 className="text-base font-extrabold text-white mt-1 leading-snug">{selectedTicket.subject}</h3>
                    </div>
                    {getSeverityBadge(selectedTicket.severity)}
                  </div>

                  <div className="space-y-3.5 border-y border-white/5 py-5 text-xs text-slate-300 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">CLIENT COMPANY</span>
                      <span className="text-white">{selectedTicket.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">TENANT UUID</span>
                      <span className="font-mono select-all text-[10px] text-slate-400">{selectedTicket.tenantId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">SUBMITTED ON</span>
                      <span className="text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">CURRENT STATUS</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedTicket.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-400" :
                        selectedTicket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium bg-black/30 border border-white/5 rounded-xl p-3.5 max-h-40 overflow-y-auto select-text">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Actions to update status */}
                  <div className="space-y-2.5 pt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resolve ticket action</label>
                    <div className="flex gap-2">
                      {selectedTicket.status !== "IN_PROGRESS" && selectedTicket.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket.ticketId, "IN_PROGRESS")}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Mark Progress
                        </button>
                      )}
                      
                      {selectedTicket.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket.ticketId, "RESOLVED")}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Resolve Case
                        </button>
                      )}

                      {selectedTicket.status === "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket.ticketId, "OPEN")}
                          className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
                          Reopen Case
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20 text-slate-500 space-y-3 select-none">
                  <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-xs font-bold uppercase tracking-wider">No Ticket Selected</p>
                  <p className="text-[11px] text-slate-600 max-w-[200px] mx-auto font-medium">Select any ticket from the support roster list to audit descriptors and toggle operational states.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* Log Support Ticket Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c101a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-sky-500" />
                    Log Client Assistance Case
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Manual system bypass to register assistance requests on behalf of clients.</p>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                
                {errorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Logistics"
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600 font-medium"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tenant ID (UUID)</label>
                    <input 
                      type="text" 
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="e.g. system UUID"
                      className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all font-mono placeholder:text-slate-600"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assistance Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short description of technical problem"
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600 font-semibold"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issue Severity</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 transition-all font-bold"
                    disabled={isSubmitting}
                  >
                    <option value="LOW">LOW SEVERITY</option>
                    <option value="MEDIUM">MEDIUM SEVERITY</option>
                    <option value="HIGH">HIGH SEVERITY</option>
                    <option value="CRITICAL">CRITICAL SYSTEM DISRUPTION</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Detailed Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full technical error stack or ticket logs..."
                    rows={4}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600 font-medium leading-relaxed resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20 -mx-6 -mb-6 p-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors select-none"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-sky-500/10 transition-colors select-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Logging ticket...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Log Issue
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
