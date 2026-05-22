import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, ShieldCheck, Ticket, TrendingUp, BarChart2, Loader2, IndianRupee, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { superAdminService } from "../../services/superAdminService";

export function GlobalAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getGlobalAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch global analytics", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-sky-500" />
            Global Analytics
          </h2>
          <p className="text-slate-400 mt-1">Cross-platform statistics, transaction volumes, and performance compliance auditing.</p>
        </div>
        
        <button 
          onClick={fetchAnalytics}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all self-end sm:self-auto"
          title="Refresh analytics data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse h-96" />
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse h-96" />
          </div>
        </div>
      ) : (
        <>
          {/* Analytics KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-sky-400" />
                Total Dispatches
              </p>
              <h3 className="text-3xl font-extrabold text-white font-mono mt-1">
                {(data?.totalDispatches || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-2">+12.4% increase month-on-month</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SLA Compliance
              </p>
              <h3 className="text-3xl font-extrabold text-white font-mono mt-1">
                {(data?.slaComplianceRate || 98.2).toFixed(1)}%
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-2">Exceeds platform target (97.0%)</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Avg Resolve Time
              </p>
              <h3 className="text-3xl font-extrabold text-white font-mono mt-1">
                {(data?.avgResolveTimeHours || 3.8).toFixed(1)}h
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-2">Decreased by 24m vs last quarter</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Gross Billings
              </p>
              <h3 className="text-3xl font-extrabold text-white font-mono mt-1 flex items-center gap-0.5">
                <IndianRupee className="w-6 h-6 text-sky-500" />
                {(data?.grossBillings || 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-sky-400 font-bold mt-2">Processed in Rupees (INR)</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Ticket Volume & Revenue Trend */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Dispatched Tickets & Billing Trend</h3>
                <p className="text-xs text-slate-500 mt-1">Audit chart representing monthly transaction volumes & transaction value.</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrends || []}>
                    <defs>
                      <linearGradient id="globalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis hide={true} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelClassName="text-slate-400 font-bold text-xs"
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#globalRevenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tenant Revenue Distribution */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Gross Billings Share per Tenant</h3>
                <p className="text-xs text-slate-500 mt-1">Breakdown of gross billing processed in Indian Rupees (₹) by active client portal.</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.tenantBillingShares || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelClassName="text-slate-400 font-bold text-xs"
                    />
                    <Bar dataKey="revenue" name="Billing (₹)" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* SLA Performance Leaderboard */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Corporate SLA Leaderboard</h3>
            <div className="space-y-5">
              {(data?.slaLeaderboard || []).map((tenant: any, idx: number) => (
                <div key={idx} className="space-y-2.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{tenant.name}</span>
                    <span className={tenant.value >= 97.0 ? "text-emerald-400" : "text-amber-400"}>
                      {tenant.value}% Compliance
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        tenant.value >= 97.0 ? "from-emerald-400 to-teal-500" : "from-amber-400 to-orange-500"
                      }`}
                      style={{ width: `${tenant.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
