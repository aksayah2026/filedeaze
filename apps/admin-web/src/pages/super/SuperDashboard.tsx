import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Activity, DollarSign, ArrowUpRight, Loader2 } from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function SuperDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          superAdminService.getStats(),
          superAdminService.getAllTenants()
        ]);
        
        if (statsRes.success) {
          setStatsData(statsRes.data);
        }
        if (tenantsRes.success) {
          setTenants(tenantsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch super dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { title: "Total Tenants", value: statsData?.totalTenants || 0, trend: "+12.5%", icon: Building2 },
    { title: "Active Users", value: statsData?.activeUsers || 0, trend: "+18.2%", icon: Users },
    { title: "Global Revenue", value: typeof statsData?.globalRevenue === 'number' ? `$${statsData.globalRevenue.toLocaleString()}` : `$${statsData?.globalRevenue || 0}`, trend: "+24.3%", icon: DollarSign },
    { title: "System Health", value: statsData?.systemHealth || "99.9%", trend: "Stable", icon: Activity },
  ];

  const revenueChartData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 5500 },
    { name: "Mar", revenue: 8000 },
    { name: "Apr", revenue: 12000 },
    { name: "May", revenue: 15000 },
    { name: "Jun", revenue: statsData?.globalRevenue ? (typeof statsData.globalRevenue === 'number' ? statsData.globalRevenue : (parseFloat(String(statsData.globalRevenue).replace(/,/g, '')) || 18450)) : 18450 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h2>
          <p className="text-slate-400 mt-1">Monitor global multi-tenant performance and metrics.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-16 h-16 text-sky-400" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4">
                    <stat.icon className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="text-slate-400 text-sm font-medium">{stat.title}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </span>
                    <span className="text-sm font-medium text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Global Revenue Growth</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Simulated across active subscription accounts</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs font-bold text-emerald-400">
                  +24.3% YoY
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="superChartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      dy={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '10px'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#superChartGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Tenants */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Tenants</h3>
              <div className="space-y-4">
                {tenants.slice(0, 4).map((tenant, i) => (
                  <div key={tenant.tenantId || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {tenant.companyName?.substring(0, 2).toUpperCase() || 'TE'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{tenant.companyName || 'Unknown Company'}</p>
                      <p className="text-xs text-slate-400">
                        {tenant.createdAt ? `Joined ${new Date(tenant.createdAt).toLocaleDateString()}` : 'Joined recently'}
                      </p>
                    </div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      tenant.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'
                    }`}>
                      {tenant.status || 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
