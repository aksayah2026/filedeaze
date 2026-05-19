import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "react-query";
import { technicianApi } from "@/api/technicianApi";
import { ticketService } from "@/services/ticketService";
import { extractApiData } from "@/lib/utils";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Clock, Star, Shield, Calendar, Activity } from "lucide-react";
import { EditTechnicianModal } from "../components/technician/EditTechnicianModal";
import axiosInstance from "@/api/axiosInstance";

export function TechnicianProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: response, isLoading: techLoading } = useQuery(['technician', id], () => technicianApi.getDetails(id!), {
    enabled: !!id
  });

  const { data: statsResponse, isLoading: statsLoading } = useQuery(['technicianStats', id], async () => {
    const response = await axiosInstance.get(`/technician/${id}/stats`);
    console.log("Technician Stats API Response:", response.data);
    return response.data;
  }, {
    enabled: !!id
  });

  const { data: allTickets, isLoading: ticketsLoading } = useQuery('allTickets', ticketService.getTickets);

  const technician = response?.data;
  const safeTickets = extractApiData(allTickets);
  const tickets = (Array.isArray(safeTickets) ? safeTickets : []).filter(
    (ticket: any) => 
      ticket?.technicianId === technician?.id || 
      ticket?.technicianId === technician?.userId ||
      ticket?.assignedTechnicianId === id || 
      ticket?.assignedTechnicianId === technician?.userId
  );

  const stats = statsResponse?.data || statsResponse;

  if (techLoading || ticketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <p>Technician not found.</p>
        <button onClick={() => navigate('/technicians')} className="mt-4 text-sky-500 hover:underline">
          Go back to Technicians
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/technicians')}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Technicians
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <img 
                src={technician.profileImage || technician.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${technician.username}`} 
                alt={technician.username}
                className="w-32 h-32 rounded-[2rem] bg-sky-500/10 border-2 border-sky-500/20 object-cover mb-6 shadow-xl shadow-sky-500/10"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${technician.username}`; }}
              />
              <h2 className="text-2xl font-bold text-white mb-2">{technician.username}</h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border mb-6 ${
                  technician.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}>
                {technician.enabled ? 'Active' : 'Inactive'}
              </span>

              <div className="w-full space-y-4 text-left border-t border-white/5 pt-6 mt-2">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-medium">{technician.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-medium">{technician.phone || technician.phoneNumber || 'N/A'}</span>
                </div>
                {(technician.createdDate || technician.registrationDate || technician.joinedDate || technician.createdAt) && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium">Joined {new Date(technician.createdDate || technician.registrationDate || technician.joinedDate || technician.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsEditOpen(true)}
                className="mt-6 w-full py-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-2xl text-xs font-bold transition-all"
              >
                Edit Profile
              </button>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem]">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Skills & Experience
              </h3>
              <div className="flex items-center gap-2 mb-6 text-sm font-bold text-sky-400">
                <Shield className="w-4 h-4" />
                {(() => {
                  const totalExperience = technician?.experienceYears > 0 
                    ? technician.experienceYears 
                    : technician?.skills?.[0]?.experienceYears || 0;
                  return `${totalExperience} Years Total Experience`;
                })()}
              </div>
              <div className="space-y-3">
                {(() => {
                  const rawSkills = technician?.skills ?? technician?.technicianSkills ?? [];
                  const skills = Array.isArray(rawSkills) ? rawSkills : [];
                  return skills.length > 0 ? (
                    skills.map((s: any, i: number) => {
                      const skillName = typeof s === 'object' ? s.skillName || s.name || s : s;
                      const expYears = typeof s === 'object' ? s.experienceYears : 0;
                      return (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-300">{skillName}</span>
                          {expYears > 0 && (
                            <span className="text-xs text-slate-500 font-bold bg-white/5 px-2 py-1 rounded-md">{expYears} Yrs</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 italic">No skills listed</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Jobs</p>
              {statsLoading ? (
                <div className="h-8 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{stats?.totalAssignedBookings ?? 0}</p>
              )}
            </div>
            <div className="bg-[#0f172a]/40 border border-emerald-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-2">Completed</p>
              {statsLoading ? (
                <div className="h-8 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                </div>
              ) : (
                <p className="text-2xl font-bold text-emerald-400">{stats?.completedServices ?? 0}</p>
              )}
            </div>
            <div className="bg-[#0f172a]/40 border border-sky-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-sky-500/70 uppercase tracking-wider mb-2">Active/Assigned</p>
              {statsLoading ? (
                <div className="h-8 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                </div>
              ) : (
                <p className="text-2xl font-bold text-sky-400">
                  {(stats?.inProgressServices ?? 0) + (stats?.pendingServices ?? 0)}
                </p>
              )}
            </div>
            <div className="bg-[#0f172a]/40 border border-amber-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider mb-2">Rating</p>
              <p className="text-2xl font-bold text-amber-400">{technician.ratings || 'N/A'}</p>
            </div>
          </div>

          <Card className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] flex-1">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  Assigned Tickets
                </h3>
              </div>
              
              <div className="space-y-4">
                {tickets.length > 0 ? (
                  tickets.map(ticket => (
                    <div key={ticket.requestId || ticket.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-sky-500/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">#{ticket.requestId?.slice(0, 8) || ticket.id?.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            ticket.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                            ticket.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-sky-500/10 text-sky-500'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{ticket.service?.serviceName || ticket.description || 'General Service'}</h4>
                        <p className="text-xs text-slate-400">{ticket.address}</p>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0">
                        <p className="text-xs font-bold text-slate-500">{new Date(ticket.createdAt || ticket.createdDate || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500 font-medium text-sm">No tickets assigned yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <EditTechnicianModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSuccess={() => {}} 
        technician={technician}
      />
    </div>
  );
}
