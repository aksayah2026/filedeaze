import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTechnicians } from "../hooks/useTechnicians";
import { extractApiData } from "@/lib/utils";
import { User, Loader2, Mail, Phone, Shield, Plus, Star, Zap, Briefcase, MapPin, Clock, MoreVertical } from "lucide-react";
import { CreateTechnicianModal } from "../components/technician/CreateTechnicianModal";
import { EditTechnicianModal } from "../components/technician/EditTechnicianModal";
import { AssignJobModal } from "../components/technician/AssignJobModal";
import { technicianApi } from "@/api/technicianApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function Technicians() {
  const rawTechnicians = useTechnicians();
  console.log("Technicians API Response Data:", rawTechnicians.data);
  const technicians = extractApiData(rawTechnicians.data);
  const isLoading = rawTechnicians.isLoading;
  const refetch = rawTechnicians.refetch;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Field Technicians</h2>
          <p className="text-xs text-slate-400 mt-1">Manage field workforce and performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-sky-500/10 flex items-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <Card key={normalizedTechnician.userId} className="bg-slate-900/60 backdrop-blur-md border border-white/[0.06] rounded-xl group hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.06)] transition-all duration-300 relative overflow-visible flex flex-col justify-between p-4 min-h-[220px]">
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    {/* Clickable Name & Avatar Group */}
                    <div 
                      onClick={() => navigate(`/technicians/${normalizedTechnician.userId}`)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group/name"
                      title="Click to view full profile"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={normalizedTechnician.profileImage || normalizedTechnician.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedTechnician.username}`} 
                          alt={normalizedTechnician.username}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 object-cover group-hover/name:border-sky-500/50 transition-colors"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedTechnician.username}`; }}
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${normalizedTechnician.enabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate group-hover/name:text-sky-400 group-hover/name:underline transition-all">
                          {normalizedTechnician.username}
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                          <span>{normalizedTechnician.experience} YRS EXP</span>
                          <span className="text-slate-800">•</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-2 h-2 fill-amber-500" />
                            {normalizedTechnician.ratings || normalizedTechnician.rating || 0}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      {/* Active status indicator */}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${
                        normalizedTechnician.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {normalizedTechnician.enabled ? 'Active' : 'Inactive'}
                      </span>

                      {/* Triple dot menu button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === normalizedTechnician.userId ? null : normalizedTechnician.userId);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === normalizedTechnician.userId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                          <div className="absolute right-0 top-8 z-20 w-28 bg-slate-900 border border-white/10 rounded-xl shadow-xl py-1 overflow-hidden">
                            <button 
                              onClick={() => {
                                setOpenDropdownId(null);
                                setSelectedTech(normalizedTechnician);
                                setEditModalOpen(true);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-[11px] font-bold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleDelete(normalizedTechnician.userId);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-white/5"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Skills/Bio Row */}
                  <p className="text-[11px] text-slate-400 font-medium leading-normal line-clamp-1 mb-2.5" title={Array.isArray(normalizedTechnician.skills) && normalizedTechnician.skills.length > 0 ? normalizedTechnician.skills.join(", ") : "No skills listed"}>
                    {Array.isArray(normalizedTechnician.skills) && normalizedTechnician.skills.length > 0
                      ? `Specializes in: ${normalizedTechnician.skills.join(", ")}`
                      : "No specialized skills listed"}
                  </p>

                  {/* Dense Stats Row with Joined Date */}
                  <div className="flex items-center justify-between gap-4 py-2 border-t border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span>Bookings:</span>
                        <span className="text-white font-mono font-extrabold">{normalizedTechnician.totalAssignedBookings ?? normalizedTechnician.totalBookings ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Active:</span>
                        <span className="text-sky-400 font-mono font-extrabold">{(normalizedTechnician.pendingServices ?? 0) + (normalizedTechnician.inProgressServices ?? 0)}</span>
                      </div>
                    </div>
                    
                    {(normalizedTechnician.createdDate || normalizedTechnician.registrationDate || normalizedTechnician.joinedDate || normalizedTechnician.createdAt) && (
                      <div className="text-right text-slate-500 normal-case font-semibold text-[9px]">
                        Joined {new Date(normalizedTechnician.createdDate || normalizedTechnician.registrationDate || normalizedTechnician.joinedDate || normalizedTechnician.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Section */}
                <div>
                  {/* Compact Contact Information */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-t border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="truncate normal-case font-semibold text-slate-400" title={normalizedTechnician?.email}>{normalizedTechnician?.email || 'No Email'}</span>
                    <span className="truncate text-right text-slate-500">{normalizedTechnician.phone || normalizedTechnician.phoneNumber || 'No Phone'}</span>
                  </div>

                  {/* High-Contrast Full-Width Action Button */}
                  <div className="border-t border-white/[0.04] pt-2.5 mt-0.5">
                    <button 
                      onClick={() => { setSelectedTech(normalizedTechnician); setAssignModalOpen(true); }}
                      className="w-full py-2 bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center gap-0.5 transition-all active:scale-95 shadow-sm shadow-white/5 shrink-0"
                    >
                      <span>Assign Job</span>
                      <span className="text-[9px] font-extrabold">↗</span>
                    </button>
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
