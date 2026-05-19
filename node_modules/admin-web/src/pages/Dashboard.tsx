import { motion } from "framer-motion";
import { extractApiData } from "@/lib/utils";
import { 
  Ticket, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  MoreVertical,
  Activity,
  Calendar,
  Filter
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStats, useLiveActivity } from "../hooks/useDashboard";

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 6890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const stats = [
  {
    title: "Service Tickets",
    value: "1,284",
    trend: "+12.5%",
    icon: Ticket,
    color: "text-sky-500",
    bg: "bg-sky-500/10"
  },
  {
    title: "Technicians",
    value: "42",
    trend: "+3.2%",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "SLA Compliance",
    value: "98.2%",
    trend: "+0.4%",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Avg Resolution",
    value: "4.2h",
    trend: "-12m",
    icon: Clock,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
];

import { useState } from 'react';

export function Dashboard() {
  const [range, setRange] = useState('30d');
  const { data: statsData, isLoading } = useDashboardStats(range);
  const { data: liveActivityData } = useLiveActivity();

  const stats = [
    {
      title: "Total Tickets",
      value: statsData?.totalServiceRequests || 0,
      trend: "+12.5%",
      icon: Ticket,
      color: "text-sky-500",
      bg: "bg-sky-500/10"
    },
    {
      title: "Active Technicians",
      value: statsData?.totalTechnicians || 0,
      trend: "+3.2%",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Completed Jobs",
      value: statsData?.completedTickets || 0,
      trend: "+0.4%",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Total Revenue",
      value: `₹${(statsData?.totalRevenue || 0).toLocaleString()}`,
      trend: "+15.2%",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
  ];

  const chartData = statsData?.revenueTrend 
    ? Object.entries(statsData.revenueTrend).map(([date, value]) => ({
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Operations Overview</h2>
          <p className="text-slate-400 font-medium">Monitoring fleet performance and customer satisfaction across all zones.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all appearance-none outline-none focus:border-sky-500/50"
            >
              <option value="7d" className="bg-[#0f172a]">Last 7 Days</option>
              <option value="30d" className="bg-[#0f172a]">Last 30 Days</option>
              <option value="90d" className="bg-[#0f172a]">Last 90 Days</option>
              <option value="year" className="bg-[#0f172a]">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative p-6 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2rem] hover:border-white/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex flex-col items-end">
                <span className={cn("text-xs font-bold", stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>
                  {stat.trend}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">vs last month</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 p-8 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-white">Revenue Metrics</h3>
              <p className="text-slate-500 text-sm font-medium">Monthly Target: ₹15,000</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-tighter">Live Revenue</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length > 0 ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    hide={true}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#030712', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '12px'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#chartGradient)" 
                  />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  No revenue data available for this period.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-8 bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Live Activity</h3>
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {liveActivityData && liveActivityData.length > 0 ? liveActivityData.map((event) => (
              <div key={event.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-sky-500/40 transition-all">
                  <Activity className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-white truncate">{event.type.replace(/_/g, ' ')}</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{event.message}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-500 py-10">
                <p className="text-sm font-medium">No recent activities</p>
              </div>
            )}
          </div>
          <button className="mt-8 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-slate-300 hover:bg-white/10 transition-all">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility for class merging
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
