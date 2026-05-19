import React, { useEffect, useState, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LiveLocation } from '../../services/locationService';
import { Phone, User, Clock, Shield } from 'lucide-react';

interface Props {
  technician: LiveLocation;
}

export const createTechnicianIcon = (status: 'AVAILABLE' | 'ON_JOB' | 'ON_THE_WAY' | 'OFFLINE', name: string) => {
  let colorClass = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
  let pulseClass = 'border-emerald-500 animate-ping';
  
  if (status === 'ON_JOB') {
    colorClass = 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.6)]';
    pulseClass = 'border-sky-500 animate-ping';
  } else if (status === 'ON_THE_WAY') {
    colorClass = 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]';
    pulseClass = 'border-amber-500 animate-ping';
  } else if (status === 'OFFLINE') {
    colorClass = 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.4)]';
    pulseClass = 'hidden';
  }

  return L.divIcon({
    className: 'custom-technician-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10">
        <!-- Outer pulsing animation ring -->
        <span class="absolute inline-flex h-full w-full rounded-full border-2 opacity-75 ${pulseClass}"></span>
        <!-- Solid inner dot -->
        <span class="relative inline-flex rounded-full h-4 w-4 ${colorClass} border-2 border-slate-900"></span>
        
        <!-- Stable name label below dot -->
        <div class="absolute top-[28px] px-1.5 py-0.5 bg-slate-950/80 border border-white/5 rounded text-[8px] font-bold text-slate-300 whitespace-nowrap shadow-md pointer-events-none">
          ${name}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
  });
};

export const TechnicianMarker: React.FC<Props> = ({ technician }) => {
  const [position, setPosition] = useState<[number, number]>([technician.latitude, technician.longitude]);
  const animationRef = useRef<number | null>(null);
  const startPosRef = useRef<[number, number]>([technician.latitude, technician.longitude]);
  const targetPosRef = useRef<[number, number]>([technician.latitude, technician.longitude]);
  const startTimeRef = useRef<number>(0);
  const duration = 2000; // Animation duration in ms

  useEffect(() => {
    const startLat = position[0];
    const startLng = position[1];
    const targetLat = technician.latitude;
    const targetLng = technician.longitude;

    if (startLat !== targetLat || startLng !== targetLng) {
      startPosRef.current = [startLat, startLng];
      targetPosRef.current = [targetLat, targetLng];
      startTimeRef.current = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeInOutQuad
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;

        const currentLat = startLat + (targetLat - startLat) * ease;
        const currentLng = startLng + (targetLng - startLng) * ease;

        setPosition([currentLat, currentLng]);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [technician.latitude, technician.longitude]);

  const icon = createTechnicianIcon(technician.status, technician.name);

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="p-2 min-w-[200px] text-slate-200">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <User className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white leading-tight">{technician.name}</h4>
              <p className="text-[10px] text-slate-400">Fleet Operations</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{technician.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  technician.status === 'AVAILABLE' ? 'bg-emerald-500' :
                  technician.status === 'ON_JOB' ? 'bg-sky-500' :
                  technician.status === 'ON_THE_WAY' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                <span className="font-bold uppercase tracking-wider text-[9px]">
                  {technician.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Updated: {formatTime(technician.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
