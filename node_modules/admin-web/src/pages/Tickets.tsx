import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, extractApiData } from "@/lib/utils";
import { useTickets, useTicketAttachments, useAssignTechnician } from "../hooks/useTickets";
import { useTechnicians } from "../hooks/useTechnicians";
import { skillApi } from "../api/skillApi";
import { attachmentApi } from "../api/attachmentApi";
import { ImagePreviewModal } from "../components/shared/ImagePreviewModal";
import { useQuery } from "react-query";
import {
  Loader2, Search, Filter, Zap, Clock, MapPin,
  User, CheckCircle2, Navigation, AlertCircle, Phone,
  Star, TrendingUp, ShieldCheck, Paperclip, Eye, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  OPEN:        { bg: "bg-sky-500/10",     text: "text-sky-500",     border: "border-sky-500/20"     },
  PENDING:     { bg: "bg-sky-500/10",     text: "text-sky-500",     border: "border-sky-500/20"     },
  ASSIGNED:    { bg: "bg-purple-500/10",  text: "text-purple-500",  border: "border-purple-500/20"  },
  IN_PROGRESS: { bg: "bg-amber-500/10",   text: "text-amber-500",   border: "border-amber-500/20"   },
  COMPLETED:   { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  CANCELLED:   { bg: "bg-red-500/10",     text: "text-red-500",     border: "border-red-500/20"     },
};

const priorityIcon = { CRITICAL: AlertCircle, HIGH: TrendingUp, MEDIUM: Zap, LOW: CheckCircle2 };

// --- Skeleton ---
function QueueSkeleton() {
  return (
    <div className="space-y-3 px-2 pb-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 animate-pulse space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-3 w-32 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

// --- Technician Skills Hook ---
function useTechnicianSkills(technicianId: string | undefined) {
  return useQuery(
    ["tech-skills", technicianId],
    () => skillApi.getByTechnicianId(technicianId!),
    {
      enabled: !!technicianId,
      select: (r) => (Array.isArray(r.data) ? r.data : []),
      staleTime: 60000,
    }
  );
}

// --- Technician Card ---
function TechnicianCard({ tech, onAssign, selectedTicketId }: { tech: any; onAssign: (techId: string) => void; selectedTicketId: string | null }) {
  const skills = tech.skills || [];
  const isAvailable = tech.enabled !== false;
  const avatarUrl = tech.profileImageUrl
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}${tech.profileImageUrl}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.username}`;

  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-sky-500/30 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={tech.username}
              className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.username}`; }}
            />
            <div className={cn("absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a]", isAvailable ? "bg-emerald-500" : "bg-amber-500")} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{tech.username}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-slate-500">{tech.experienceYears || 0} YRS</p>
              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-500" />
                {tech.ratings || 0}
              </div>
            </div>
          </div>
        </div>
        <span className={cn("text-[9px] font-bold px-2 py-1 rounded-full border", isAvailable ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20")}>
          {isAvailable ? "AVAILABLE" : "BUSY"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
        {skills.length > 0
          ? skills.slice(0, 3).map((s: any, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] font-bold uppercase text-slate-400 rounded-lg">
                {s.skillName}
              </span>
            ))
          : <span className="text-[10px] text-slate-600 italic">No skills listed</span>
        }
      </div>

      <button
        onClick={() => onAssign(tech.userId)}
        disabled={!isAvailable || !selectedTicketId}
        className="w-full py-2 text-xs font-bold bg-sky-500 text-white rounded-xl hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20 active:scale-95"
      >
        Assign to Ticket
      </button>
    </div>
  );
}

// --- Attachment Gallery ---
function AttachmentGallery({ ticketId }: { ticketId: string }) {
  const { data: attachments = [], isLoading } = useTicketAttachments(ticketId);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  if (isLoading) return (
    <div className="grid grid-cols-3 gap-2">
      {[1,2,3].map(i => <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />)}
    </div>
  );
  if (!attachments.length) return null;

  return (
    <>
      <div className="mb-5 bg-black/20 rounded-2xl p-4 border border-white/5">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
          <Paperclip className="w-3 h-3" />
          Customer Attachments ({attachments.length})
        </p>
        <div className="grid grid-cols-3 gap-2">
          {attachments.map((att, idx) => (
            <button
              key={att.id}
              onClick={() => setPreviewIdx(idx)}
              className="relative group rounded-xl overflow-hidden bg-slate-800 border border-white/10 aspect-square hover:border-sky-500/50 transition-all"
            >
              <img
                src={attachmentApi.getFullUrl(att.fileUrl)}
                alt={att.fileName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/0f172a/334155?text=File'; }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {previewIdx !== null && (
        <ImagePreviewModal
          attachments={attachments}
          initialIndex={previewIdx}
          isOpen={true}
          onClose={() => setPreviewIdx(null)}
          getFullUrl={attachmentApi.getFullUrl}
        />
      )}
    </>
  );
}

// --- Main Tickets Page ---
export function Tickets() {
  const rawTickets = useTickets();
  const rawTechnicians = useTechnicians();
  const tickets = extractApiData(rawTickets.data);
  const technicians = extractApiData(rawTechnicians.data);
  const ticketsLoading = rawTickets.isLoading;
  const techLoading = rawTechnicians.isLoading;
  const ticketsError = rawTickets.error;
  const { mutate: doAssign, isLoading: assigning } = useAssignTechnician();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = (Array.isArray(tickets) ? tickets : []).filter((t: any) =>
    !searchQuery ||
    String(t.requestId || t.id).includes(searchQuery) ||
    (t.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.customer?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicket = filteredTickets.find(t => String(t.requestId || t.id) === selectedTicketId)
    || filteredTickets[0]
    || null;

  const selectedId = selectedTicket ? String(selectedTicket.requestId || selectedTicket.id) : null;

  const handleAssign = useCallback((techId: string) => {
    if (!selectedId) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];
    doAssign(
      { id: selectedId, technicianId: techId, scheduledDate: today, scheduledTime: now },
      {
        onSuccess: () => toast.success("Technician assigned successfully!"),
        onError: () => toast.error("Failed to assign technician."),
      }
    );
  }, [selectedId, doAssign]);

  const handleAutoAssign = useCallback(() => {
    if (!selectedId || technicians.length === 0) {
      toast.error("No technicians available for auto-assign.");
      return;
    }
    const available = technicians.filter(t => t.enabled !== false);
    if (!available.length) { toast.error("No available technicians."); return; }
    const tech = available[0];
    handleAssign(tech.userId);
  }, [selectedId, technicians, handleAssign]);

  if (ticketsError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="w-12 h-12 text-red-500 opacity-60" />
      <p className="text-slate-400 font-medium">Failed to load tickets. Check your connection.</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Retry</button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden gap-6">

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Dispatch Center
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-xs font-bold border border-sky-500/20 uppercase tracking-wider">Live</span>
          </h2>
          <p className="text-slate-400 font-medium mt-1">{filteredTickets.length} active tickets · Real-time routing</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID, address, customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a]/60 backdrop-blur-md border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          <button
            onClick={handleAutoAssign}
            disabled={assigning || !selectedId}
            className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white/20" />}
            Auto Assign
          </button>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">

        {/* LEFT: Queue */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden p-2">
          <div className="px-4 pt-4 pb-2 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Ticket Queue</h3>
            <span className="text-xs font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">{filteredTickets.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-3 pb-4">
            {ticketsLoading ? <QueueSkeleton /> : (
              <>
                <AnimatePresence>
                  {filteredTickets.map((ticket, idx) => {
                    const id = String(ticket.requestId || ticket.id);
                    const isSelected = selectedId === id || (!selectedTicketId && idx === 0);
                    const sc = statusColors[ticket.status || 'OPEN'] || statusColors['OPEN'];
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedTicketId(id)}
                        className={cn(
                          "p-4 rounded-2xl border cursor-pointer transition-all duration-300",
                          isSelected
                            ? "bg-sky-500/10 border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn("text-xs font-bold uppercase tracking-wider", isSelected ? "text-sky-400" : "text-slate-400")}>
                            #FE-{id.slice(0, 6)}
                          </span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", sc.bg, sc.text, sc.border)}>
                            {ticket.status || 'OPEN'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white line-clamp-2 mb-3 leading-snug">
                          {ticket?.services?.length ? ticket.services.map(s => s?.title || s?.serviceName).join(', ') : ticket?.service?.title || ticket?.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{ticket.address || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {!filteredTickets.length && (
                  <div className="text-center py-10 px-4">
                    <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                    <p className="text-slate-400 text-sm font-medium">No tickets found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CENTER: Ticket Details */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {selectedTicket ? (
            <div className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedTicket?.services?.length ? selectedTicket.services.map(s => s?.title || s?.serviceName).join(', ') : selectedTicket?.service?.title || 'Ticket Detail'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-sky-400 font-bold">#FE-{selectedId?.slice(0, 6)}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{new Date(selectedTicket.createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>
                <span className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border",
                  (statusColors[selectedTicket.status] || statusColors['OPEN']).bg,
                  (statusColors[selectedTicket.status] || statusColors['OPEN']).text,
                  (statusColors[selectedTicket.status] || statusColors['OPEN']).border
                )}>
                  {selectedTicket.status || 'OPEN'}
                </span>
              </div>

              {/* Description */}
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-300">{selectedTicket.description || 'No description provided'}</p>
              </div>

              {/* Services & Pricing */}
              {selectedTicket.services?.length > 0 && (
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Services</p>
                  {selectedTicket.services.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        {s.imageUrl
                          ? <img src={s.imageUrl} alt={s.serviceName} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                          : <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-sky-500" /></div>
                        }
                        <div>
                          <p className="text-sm font-bold text-white">{s?.title || s?.serviceName}</p>
                          {s.description && <p className="text-xs text-slate-400 line-clamp-1">{s.description}</p>}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-sky-400 shrink-0">₹{s.price ?? 0}</p>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <p className="text-sm font-bold text-slate-400">Total</p>
                    <p className="text-lg font-bold text-white">₹{selectedTicket.totalAmount ?? 0}</p>
                  </div>
                </div>
              )}

              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Customer</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><User className="w-4 h-4 text-purple-400" /></div>
                    <div>
                      <p className="text-sm font-bold text-white">{selectedTicket?.customer?.name || selectedTicket?.customer?.username || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedTicket.customer?.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-200 leading-snug">{selectedTicket.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Technician */}
              {selectedTicket.assignedTechnician && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Assigned Technician</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTicket.assignedTechnician.username}`}
                      className="w-10 h-10 rounded-xl bg-slate-800"
                      alt={selectedTicket.assignedTechnician.username}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{selectedTicket?.technician?.name || selectedTicket?.assignedTechnician?.username}</p>
                      <p className="text-xs text-purple-400">{selectedTicket.assignedTechnician.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              <AttachmentGallery ticketId={selectedId!} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-[2.5rem] bg-[#0f172a]/20 min-h-[300px]">
              <ImageIcon className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
              <p className="text-slate-400 font-medium">Select a ticket to view details</p>
            </div>
          )}
        </div>

        {/* RIGHT: Technicians */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden p-2">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">Technician Roster</h3>
            <p className="text-xs text-slate-500">Available field agents</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-3 pb-4">
            {techLoading
              ? <QueueSkeleton />
              : (Array.isArray(technicians) ? technicians : []).length === 0
                ? <div className="text-center py-10"><p className="text-slate-500 text-sm">No technicians registered.</p></div>
                : (Array.isArray(technicians) ? technicians : []).map((tech: any) => (
                    <TechnicianCard
                      key={tech.userId}
                      tech={tech}
                      onAssign={handleAssign}
                      selectedTicketId={selectedId}
                    />
                  ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}
