import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "../hooks/useDashboard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, Briefcase, UserCheck } from "lucide-react";

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function Analytics() {
  const { data: stats, isLoading } = useDashboardStats();

  const categoryData = stats?.categoryWiseBookings 
    ? Object.entries(stats.categoryWiseBookings).map(([name, value]) => ({ name, value }))
    : [];

  const revenueTrendData = stats?.revenueTrend 
    ? Object.entries(stats.revenueTrend).map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: value
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Business Intelligence</h2>
        <p className="text-slate-400 mt-2">Detailed performance analytics and revenue metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Growth */}
        <Card className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis hide={true} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              Service Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[400px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-10">
              {categoryData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{item.name}</span>
                  <span className="text-xs font-bold text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
