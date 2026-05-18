import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTechnicians } from "../hooks/useTechnicians";
import { extractApiData } from "@/lib/utils";
import { User, Loader2, Mail, Phone, Shield, Plus, Star, Zap, Briefcase, MapPin, Clock } from "lucide-react";
import { CreateTechnicianModal } from "../components/technician/CreateTechnicianModal";
import { EditTechnicianModal } from "../components/technician/EditTechnicianModal";
import { AssignJobModal } from "../components/technician/AssignJobModal";
import { technicianApi } from "@/api/technicianApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export function Technicians() {
  const rawTechnicians = useTechnicians();
  const technicians = extractApiData(rawTechnicians.data);
  const isLoading = rawTechnicians.isLoading;
  const refetch = rawTechnicians.refetch;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this technician?")) {
      try {
        await technicianApi.delete(id);
        toast.success("Technician deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete technician");
      }
    }
  };

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

      <EditTechnicianModal 
        isOpen={editModalOpen} 
        onClose={() => { setEditModalOpen(false); setSelectedTech(null); }} 
        onSuccess={() => refetch()} 
        technician={selectedTech}
      />

      <AssignJobModal 
        isOpen={assignModalOpen} 
        onClose={() => { setAssignModalOpen(false); setSelectedTech(null); }} 
        technician={selectedTech}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(technicians) ? technicians : []).map((tech: any) => {
          console.log("Technician:", tech);
          const experience = tech?.experienceYears > 0 
            ? tech.experienceYears 
            : tech?.skills?.[0]?.experienceYears || tech?.technicianSkills?.[0]?.experienceYears || 0;
          const skillNames = Array.isArray(tech?.skills)
            ? tech.skills.map((s: any) => typeof s === 'object' ? s.skillName || s.name || s : s)
            : Array.isArray(tech?.technicianSkills) ? tech.technicianSkills : [];

          const normalizedTechnician = {
            ...tech,
            experience,
            skills: skillNames,
          };

          return (
            <Card key={normalizedTechnician.userId} className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] group hover:border-sky-500/40 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="relative">
                    <img 
                      src={normalizedTechnician.profileImage || normalizedTechnician.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedTechnician.username}`} 
                      alt={normalizedTechnician.username}
                      className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedTechnician.username}`; }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a] ${normalizedTechnician.enabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    normalizedTechnician.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {normalizedTechnician.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{normalizedTechnician.username}</h3>
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-sky-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    {normalizedTechnician.experience} YRS EXP
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {normalizedTechnician.ratings || normalizedTechnician.rating || 0}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6 min-h-[24px]">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase mb-1">Skills</span>
                  <p className="text-xs text-slate-300 font-medium">
                    {Array.isArray(normalizedTechnician.skills) && normalizedTechnician.skills.length > 0
                      ? normalizedTechnician.skills.join(", ")
                      : "No skills listed"}
                  </p>
                </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 rounded-2xl p-4 border border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bookings</p>
                  <p className="text-lg font-bold text-white">{normalizedTechnician.totalBookings || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active</p>
                  <p className="text-lg font-bold text-sky-400">{normalizedTechnician.activeRequests || 0}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{normalizedTechnician?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">{normalizedTechnician.phone || normalizedTechnician.phoneNumber || 'N/A'}</span>
                </div>
                {(normalizedTechnician.createdDate || normalizedTechnician.registrationDate || normalizedTechnician.joinedDate || normalizedTechnician.createdAt) && (
                  <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Joined {new Date(normalizedTechnician.createdDate || normalizedTechnician.registrationDate || normalizedTechnician.joinedDate || normalizedTechnician.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => { setSelectedTech(normalizedTechnician); setEditModalOpen(true); }}
                  className="px-3 py-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(normalizedTechnician.userId)}
                  className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => navigate(`/technicians/${normalizedTechnician.userId}`)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-all"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => { setSelectedTech(normalizedTechnician); setAssignModalOpen(true); }}
                  className="flex-1 py-3 bg-sky-500/10 hover:bg-sky-500/20 rounded-2xl text-xs font-bold text-sky-500 transition-all"
                >
                  Assign Job
                </button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
