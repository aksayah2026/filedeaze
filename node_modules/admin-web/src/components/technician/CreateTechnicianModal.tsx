import { useState } from "react";
import { X, Loader2, UserPlus, Mail, Phone, Lock, Briefcase, MapPin, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { technicianApi } from "@/api/technicianApi";
import toast from "react-hot-toast";

export function CreateTechnicianModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    experienceYears: "0",
    skills: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',')
        .filter(s => s.trim())
        .map(s => ({
          skillName: s.trim(),
          experienceYears: parseInt(formData.experienceYears) || 0,
          proficiencyLevel: 3
        }));

      const payload = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears) || 0,
        skills: skillsArray,
        address: formData.address ? [{ address: formData.address, label: "Home", active: true }] : []
      };
      await technicianApi.create(payload);
      toast.success("Technician created successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create technician");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10"
        >
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Register Technician</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required name="username" value={formData.username} onChange={handleChange} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience (Years)</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="5" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills (Comma separated)</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required name="skills" value={formData.skills} onChange={handleChange} placeholder="HVAC, Plumbing, Electrical" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Operating region or home base" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Register Technician'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
