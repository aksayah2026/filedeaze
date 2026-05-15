import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, User, Loader2 } from "lucide-react";
import { useTechnicians } from "../hooks/useTechnicians";

export function LiveTracking() {
  const { data: technicians, isLoading, error } = useTechnicians();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      <div className="flex-1 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden relative">
         {/* Map Placeholder */}
         <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            <div className="text-center space-y-4">
                <Navigation className="w-12 h-12 text-sky-500 animate-pulse mx-auto" />
                <p className="text-slate-400 font-medium">Live Fleet Map View</p>
                <div className="flex gap-4">
                    {technicians?.map(tech => (
                        <div 
                            key={tech.userId} 
                            className="absolute" 
                            style={{ 
                                top: `${(Math.random() * 80) + 10}%`, 
                                left: `${(Math.random() * 80) + 10}%` 
                            }}
                        >
                            <div className="relative group cursor-pointer">
                              <MapPin className={`w-8 h-8 ${tech.enabled ? 'text-emerald-500' : 'text-red-500'} drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-white/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                <p className="text-xs font-bold text-white">{tech.username}</p>
                                <p className="text-[10px] text-slate-500">{tech.phone}</p>
                              </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>

      <div className="w-80 flex flex-col gap-4">
        <Card className="flex-1 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 p-6">
            <CardTitle className="text-lg text-white font-bold">Technicians</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-4">
              {technicians?.map((tech) => (
                <div key={tech.userId} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-sky-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <User className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{tech.username}</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          tech.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                        }`} />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {tech.enabled ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!technicians || technicians.length === 0) && (
                <p className="text-center text-slate-500 py-10 text-sm">No technicians found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
