import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTechnicians } from "../hooks/useTechnicians";
import { User, Loader2, Mail, Phone, Shield, Plus, Star, Zap, Briefcase, MapPin, Clock } from "lucide-react";
import { CreateTechnicianModal } from "../components/technician/CreateTechnicianModal";

export function Technicians() {
  const { data: technicians, isLoading, refetch } = useTechnicians();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Field Technicians</h2>
          <p className="text-slate-400 mt-2">Manage field workforce and performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Technician</span>
        </button>
      </div>

      <CreateTechnicianModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => refetch()} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians?.map((tech) => (
          <Card key={tech.userId} className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] group hover:border-sky-500/40 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="relative">
                  <img 
                    src={tech.profileImage || tech.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.username}`} 
                    alt={tech.username}
                    className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.username}`; }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a] ${tech.enabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  tech.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}>
                  {tech.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{tech.username}</h3>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-sky-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  {tech.experienceYears || 0} YRS EXP
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {tech.ratings || 0}
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6 min-h-[24px]">
                {tech.skills && tech.skills.length > 0 ? (
                  tech.skills.slice(0, 3).map((s: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      {s.skillName}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-600 italic">No skills listed</span>
                )}
                {tech.skills && tech.skills.length > 3 && (
                  <span className="text-[9px] text-slate-500 font-bold">+{tech.skills.length - 3}</span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 rounded-2xl p-4 border border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bookings</p>
                  <p className="text-lg font-bold text-white">{tech.totalBookings || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active</p>
                  <p className="text-lg font-bold text-sky-400">{tech.activeRequests || 0}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{tech.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">{tech.phone || tech.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium truncate">{tech.address?.[0]?.address || 'No address'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Joined {tech.registrationDate ? new Date(tech.registrationDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-all">
                  View Profile
                </button>
                <button className="flex-1 py-3 bg-sky-500/10 hover:bg-sky-500/20 rounded-2xl text-xs font-bold text-sky-500 transition-all">
                  Assign Job
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
