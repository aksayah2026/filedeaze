import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService, LiveLocation } from '../../services/locationService';
import { TechnicianMarker } from '../../components/map/TechnicianMarker';
import { Search, Filter, Loader2, Navigation, AlertTriangle, User, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Fix Leaflet default marker icon issue globally
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



export const TechnicianLiveTracking: React.FC = () => {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  // Fetch live locations
  const fetchLocations = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await locationService.getLiveLocations();
      setLocations(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch live tracking data:', err);
      setError('Unable to load live fleet tracking. Please check connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh every 10 seconds
  useEffect(() => {
    fetchLocations();

    const interval = setInterval(() => {
      fetchLocations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter technicians based on search and selected status
  const filteredTechnicians = useMemo(() => {
    return (locations || []).filter((tech) => {
      const matchesSearch = tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tech.phoneNumber?.includes(searchQuery);
      const matchesFilter = statusFilter === 'ALL' || tech.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [locations, searchQuery, statusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = (locations || []).length;
    const online = (locations || []).filter(t => t.status !== 'OFFLINE').length;
    const onJob = (locations || []).filter(t => t.status === 'ON_JOB').length;
    const available = (locations || []).filter(t => t.status === 'AVAILABLE').length;
    const onTheWay = (locations || []).filter(t => t.status === 'ON_THE_WAY').length;
    const offline = (locations || []).filter(t => t.status === 'OFFLINE').length;

    return { total, online, onJob, available, onTheWay, offline };
  }, [locations]);

  // Fly/pan map to the clicked technician's position
  const handleFocusTechnician = (tech: LiveLocation) => {
    setSelectedTechId(tech.technicianId);
    if (map) {
      map.setView([tech.latitude, tech.longitude], 15, {
        animate: true,
        duration: 1
      });
    }
  };

  useEffect(() => {
    if (map && filteredTechnicians && filteredTechnicians.length > 0) {
      const validLocs = filteredTechnicians.filter(loc => 
        loc.latitude !== undefined && loc.latitude !== null && 
        loc.longitude !== undefined && loc.longitude !== null
      );
      if (validLocs.length > 0) {
        const bounds = L.latLngBounds(validLocs.map(loc => [loc.latitude, loc.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [map, filteredTechnicians]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        <p className="text-slate-400 font-medium animate-pulse">Initializing Live Fleet Map...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-6 relative">
      {/* Dynamic override styles for premium Dark Theme Leaflet widgets */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #090d16 !important;
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: #f1f5f9 !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6) !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255,255,255,0.08) !important;
          background-color: #0f172a !important;
          box-shadow: none !important;
          border-radius: 0.75rem !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: #0f172a !important;
          color: #cbd5e1 !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .leaflet-bar a:hover {
          background-color: #1e293b !important;
          color: #fff !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 8px 8px 0 0 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* Sidebar Control Panel */}
      <div className="w-full md:w-96 flex flex-col gap-4 h-full">
        <Card className="flex-1 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-sky-500 animate-pulse" />
                Live Fleet Tracking
              </h2>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
              )}
            </div>

            {/* Quick KPIs Metrics Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Online</p>
                <p className="text-base font-bold text-emerald-400">{stats.online}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">On Job</p>
                <p className="text-base font-bold text-sky-400">{stats.onJob}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-base font-bold text-white">{stats.total}</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0f172a]">All Statuses</option>
                  <option value="AVAILABLE" className="bg-[#0f172a]">Available</option>
                  <option value="ON_JOB" className="bg-[#0f172a]">On Job</option>
                  <option value="ON_THE_WAY" className="bg-[#0f172a]">On The Way</option>
                  <option value="OFFLINE" className="bg-[#0f172a]">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="mx-6 my-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-400 leading-normal">{error}</p>
            </div>
          )}

          {/* Technician List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {filteredTechnicians.map((tech) => {
              const isActive = selectedTechId === tech.technicianId;
              let statusColor = 'bg-emerald-500';
              let statusText = 'Available';
              if (tech.status === 'ON_JOB') {
                statusColor = 'bg-sky-500';
                statusText = 'On Job';
              } else if (tech.status === 'ON_THE_WAY') {
                statusColor = 'bg-amber-500';
                statusText = 'On The Way';
              } else if (tech.status === 'OFFLINE') {
                statusColor = 'bg-slate-500';
                statusText = 'Offline';
              }

              return (
                <div
                  key={tech.technicianId}
                  onClick={() => handleFocusTechnician(tech)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isActive 
                      ? 'bg-sky-500/10 border-sky-500/40' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5`}>
                    <User className={`w-4.5 h-4.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-white truncate leading-tight mb-0.5">{tech.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{statusText}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredTechnicians.length === 0 && (
              <p className="text-center text-slate-500 py-10 text-xs font-medium">No workforce located.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Live Map Panel */}
      <div className="flex-1 h-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative bg-slate-950 min-h-[400px]">
        {filteredTechnicians.length === 0 ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-[10] gap-4 rounded-[2.5rem]">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <Navigation className="w-8 h-8 text-sky-500 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">No Active Fleet Located</p>
              <p className="text-slate-400 text-xs max-w-xs">There are currently no technicians online or matching your status filters.</p>
            </div>
          </div>
        ) : null}

        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={12}
          ref={setMap}
          zoomControl={true}
          style={{ height: '100vh', width: '100%', minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup>
            {filteredTechnicians
              .filter(tech => tech.latitude !== undefined && tech.latitude !== null && tech.longitude !== undefined && tech.longitude !== null)
              .map((tech) => (
                <TechnicianMarker key={tech.technicianId} technician={tech} />
              ))}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};
