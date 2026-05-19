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
  Star, TrendingUp, ShieldCheck, Paperclip, Eye, Image as ImageIcon,
  FileText, Download
} from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  OPEN:                  { bg: "bg-sky-500/10",     text: "text-sky-500",     border: "border-sky-500/20"     },
  PENDING:               { bg: "bg-sky-500/10",     text: "text-sky-500",     border: "border-sky-500/20"     },
  AWAITING_CONFIRMATION: { bg: "bg-sky-500/10",     text: "text-sky-500",     border: "border-sky-500/20"     },
  ASSIGNED:              { bg: "bg-purple-500/10",  text: "text-purple-500",  border: "border-purple-500/20"  },
  IN_PROGRESS:           { bg: "bg-amber-500/10",   text: "text-amber-500",   border: "border-amber-500/20"   },
  COMPLETED:             { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  CANCELLED:             { bg: "bg-red-500/10",     text: "text-red-500",     border: "border-red-500/20"     },
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

  // Filter image attachments for the preview modal
  const imageAttachments = attachments.filter((att: any) => {
    const isImgType = att.fileType === 'IMAGE';
    const isImgExt = att.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(att.fileUrl);
    return isImgType || isImgExt;
  });

  const handleAttachmentClick = (att: any) => {
    const isImgType = att.fileType === 'IMAGE';
    const isImgExt = att.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(att.fileUrl);
    if (isImgType || isImgExt) {
      const imgIdx = imageAttachments.findIndex((i: any) => i.id === att.id);
      if (imgIdx !== -1) {
        setPreviewIdx(imgIdx);
      }
    } else {
      window.open(attachmentApi.getFullUrl(att.fileUrl), '_blank');
    }
  };

  return (
    <>
      <div className="mb-5 bg-black/20 rounded-2xl p-4 border border-white/5">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
          <Paperclip className="w-3 h-3" />
          Customer Attachments ({attachments.length})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {attachments.map((att: any, idx: number) => {
            const isImgType = att.fileType === 'IMAGE';
            const isImgExt = att.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(att.fileUrl);
            const isImage = isImgType || isImgExt;
            
            const filename = att.fileUrl 
              ? att.fileUrl.substring(att.fileUrl.lastIndexOf('/') + 1) 
              : `Attachment-${idx + 1}`;

            return (
              <div
                key={att.id}
                className="relative group rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex flex-col hover:border-sky-500/50 transition-all p-2"
              >
                {isImage ? (
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2 bg-slate-900">
                    <img
                      src={attachmentApi.getFullUrl(att.fileUrl)}
                      alt={filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/0f172a/334155?text=Image'; }}
                    />
                    <button
                      onClick={() => handleAttachmentClick(att)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-square w-full rounded-lg bg-sky-500/5 border border-sky-500/10 flex flex-col items-center justify-center p-3 mb-2">
                    <FileText className="w-10 h-10 text-sky-400 mb-2 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 text-center truncate w-full px-1">
                      {filename}
                    </span>
                    <button
                      onClick={() => handleAttachmentClick(att)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-center px-1 min-w-0">
                  <span className="text-[10px] text-slate-400 font-semibold truncate flex-1 pr-2">
                    {att.description || filename}
                  </span>
                  <a
                    href={attachmentApi.getFullUrl(att.fileUrl)}
                    download={filename}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewIdx !== null && (
        <ImagePreviewModal
          attachments={imageAttachments}
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
                        <div className="flex justify-between items-center gap-2 mb-2 min-w-0">
                          <span className={cn("text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap truncate flex-1 min-w-0", isSelected ? "text-sky-400" : "text-slate-400")}>
                            #FE-{id.slice(0, 8)}
                          </span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap", sc.bg, sc.text, sc.border)}>
                            {ticket.status || 'OPEN'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white line-clamp-2 mb-3 leading-snug break-words overflow-hidden">
                          {ticket?.services?.length ? ticket.services.map(s => s?.title || s?.serviceName).join(', ') : ticket?.service?.title || ticket?.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                            <span className="truncate">{ticket.address || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
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
        <div className="lg:col-span-5 flex flex-col bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden">
          {selectedTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Pulse background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {/* Premium Header */}
                <div className="flex flex-col gap-2.5 pb-4 mb-4 border-b border-white/5">
                  <div className="flex justify-between items-center gap-4">
                    {/* Ticket ID Glass Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                      <FileText className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="text-[10px] font-mono font-extrabold text-sky-400 tracking-wider whitespace-nowrap">
                        TICKET #FE-{selectedId?.slice(0, 8)}
                      </span>
                    </div>

                    {/* Status Badge with Live Pulsing Dot */}
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider whitespace-nowrap shadow-sm shadow-black/10",
                      (statusColors[selectedTicket.status || 'OPEN'] || statusColors['OPEN']).bg,
                      (statusColors[selectedTicket.status || 'OPEN'] || statusColors['OPEN']).text,
                      (statusColors[selectedTicket.status || 'OPEN'] || statusColors['OPEN']).border
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        selectedTicket.status === 'COMPLETED' ? "bg-emerald-400" :
                        selectedTicket.status === 'CANCELLED' ? "bg-red-400" :
                        selectedTicket.status === 'IN_PROGRESS' ? "bg-amber-400" : "bg-sky-400"
                      )} />
                      {selectedTicket.status || 'OPEN'}
                    </div>
                  </div>

                  {/* Service/Ticket Title */}
                  <h3 className="text-base font-extrabold text-white leading-snug tracking-tight mt-0.5">
                    {selectedTicket?.services?.length 
                      ? selectedTicket.services.map(s => s?.title || s?.serviceName).join(', ') 
                      : selectedTicket?.service?.title || 'Ticket Details'}
                  </h3>

                  {/* Date & Time Metadata */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-semibold">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-sky-400/80" />
                      <span className="text-slate-300">
                        {new Date(selectedTicket.createdAt || Date.now()).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span className="text-slate-700 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-indigo-400/80" />
                      <span className="text-slate-300">
                        {new Date(selectedTicket.createdAt || Date.now()).toLocaleTimeString(undefined, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {selectedTicket.priority && (
                      <>
                        <span className="text-slate-700 hidden sm:inline">•</span>
                        <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-[9px] font-extrabold text-red-400 rounded-md uppercase tracking-wide">
                          {selectedTicket.priority}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 mb-4 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-sky-500/50 to-indigo-500/50 opacity-60" />
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-sky-400" />
                    Customer Brief & Requirements
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedTicket.description || 'No specific requirements or instructions provided by the customer.'}
                  </p>
                </div>

                {/* Services & Billing Breakdown */}
                {selectedTicket.services?.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 mb-4 space-y-3">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Requested Services
                    </p>
                    <div className="space-y-2">
                      {selectedTicket.services.map((s, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 border border-white/[0.02] p-2.5 rounded-lg hover:bg-white/[0.06] transition-all group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.serviceName} className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-white/10 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Zap className="w-4 h-4 text-sky-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors truncate">{s?.title || s?.serviceName}</p>
                              {s.description && (
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.description}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-bold text-white shrink-0 font-mono pl-3">₹{s.price ?? 0}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <p className="text-xs font-bold text-slate-400">Total Billing Amount</p>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <span className="text-[9px] font-bold text-emerald-400/80">INR</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">₹{selectedTicket.totalAmount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Customer Info Card */}
                  <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between min-h-[140px]">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-purple-400" />
                        Client Details
                      </p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate" title={selectedTicket?.customer?.name || selectedTicket?.customer?.username || 'Guest Client'}>
                            {selectedTicket?.customer?.name || selectedTicket?.customer?.username || 'Guest Client'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5" title={selectedTicket?.customer?.email}>
                            {selectedTicket?.customer?.email || 'No email registered'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Contact Phone</span>
                      {selectedTicket.customer?.phoneNumber ? (
                        <a 
                          href={`tel:${selectedTicket.customer.phoneNumber}`}
                          className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Phone className="w-3 h-3 text-sky-400" />
                          <span>{selectedTicket.customer.phoneNumber}</span>
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Not Available</span>
                      )}
                    </div>
                  </div>

                  {/* Location Info Card */}
                  <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between min-h-[140px]">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        Service Location
                      </p>
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Navigation className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-300 font-medium leading-relaxed break-words line-clamp-3" title={selectedTicket.address}>
                            {selectedTicket.address || 'No service address provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Coordinates</span>
                      {selectedTicket.address ? (
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(selectedTicket.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>Open Google Maps</span>
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Not Available</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Technician */}
                {selectedTicket.assignedTechnician && (
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 mb-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-purple-400" />
                      Assigned Field Specialist
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTicket.assignedTechnician.username}`}
                            className="w-10 h-10 rounded-lg bg-slate-800 border border-purple-500/20 object-cover"
                            alt={selectedTicket.assignedTechnician.username}
                          />
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0f172a]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                            {selectedTicket?.technician?.name || selectedTicket?.assignedTechnician?.username}
                          </p>
                          <p className="text-[10px] text-purple-400/90 font-medium truncate mt-0.5">
                            {selectedTicket.assignedTechnician.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/25 text-[9px] font-extrabold text-purple-400 rounded-lg tracking-wider uppercase">
                          Active Dispatch
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <AttachmentGallery ticketId={selectedId!} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a]/20 min-h-[300px] p-6 text-center">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-3 opacity-40 animate-pulse" />
              <p className="text-slate-400 text-xs font-semibold">Select a ticket to view details</p>
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
