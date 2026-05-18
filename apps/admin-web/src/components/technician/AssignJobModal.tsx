import { useState } from "react";
import { X, Loader2, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ticketService } from "@/services/ticketService";
import { useTickets } from "@/hooks/useTickets";
import toast from "react-hot-toast";

export function AssignJobModal({ isOpen, onClose, technician }: { isOpen: boolean, onClose: () => void, technician: any }) {
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const { data: tickets } = useTickets();

  const pendingTickets = tickets?.filter(t => t.status === "PENDING" || !t.assignedTechnicianId) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) {
      toast.error("Please select a ticket");
      return;
    }
    setLoading(true);
    try {
      await ticketService.assignTechnician(ticketId, technician.userId);
      toast.success("Job assigned successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign job");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !technician) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10"
        >
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Assign Job</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-300 mb-4">
                Assign a pending ticket to <strong className="text-white">{technician.username}</strong>.
              </p>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Ticket</label>
              <select 
                required 
                value={ticketId} 
                onChange={(e) => setTicketId(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
              >
                <option value="" className="bg-[#0f172a] text-slate-400">-- Select a Ticket --</option>
                {pendingTickets.map(ticket => (
                  <option key={ticket.requestId || ticket.id} value={ticket.requestId || ticket.id} className="bg-[#0f172a] text-white">
                    {ticket.service?.serviceName || ticket.description || ticket.id} - {ticket.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Assigning...' : 'Assign Job'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
