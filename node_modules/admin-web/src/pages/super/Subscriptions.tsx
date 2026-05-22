import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, ShieldCheck, Zap, Star, ArrowUpRight, TrendingUp, Sparkles, 
  CheckCircle2, Loader2, IndianRupee, RefreshCw
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";

export function Subscriptions() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getSubscriptions();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const plans = [
    {
      name: "Starter Plan",
      description: "Ideal for small regional operations",
      monthlyPrice: 1999,
      yearlyPrice: 19990,
      icon: Zap,
      color: "from-amber-400 to-orange-500",
      features: [
        "1 Tenant Admin Role",
        "Up to 10 Field Technicians",
        "Standard Job Scheduling",
        "Core Mobile App Integration",
        "Email Support"
      ]
    },
    {
      name: "Professional Plan",
      description: "Best for growing field workforces",
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      icon: ShieldCheck,
      color: "from-sky-400 to-blue-600",
      popular: true,
      features: [
        "5 Tenant Admin Roles",
        "Up to 50 Field Technicians",
        "Advanced Dispatch Routing",
        "SMS & Email Alert Automation",
        "Priority 24/7 Chat Support",
        "SLA Tracking & Reporting"
      ]
    },
    {
      name: "Enterprise Plan",
      description: "Uncapped scaling and platform control",
      monthlyPrice: 14999,
      yearlyPrice: 149990,
      icon: Star,
      color: "from-indigo-500 to-purple-600",
      features: [
        "Unlimited Admin Roles",
        "Unlimited Field Technicians",
        "Dedicated Database Instance",
        "Custom Workflow Automation",
        "Full API Integration Access",
        "Dedicated Account Executive",
        "SLA & Compliance Auditing"
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-sky-500" />
            Subscription Licensing
          </h2>
          <p className="text-slate-400 mt-1">Manage software pricing plans, subscription MRR, and active corporate client agreements.</p>
        </div>
        
        {/* Monthly / Yearly billing cycle switch & Refresh */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={fetchSubscriptionData}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : ""}`} />
          </button>
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === "yearly" ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[9px] px-1 py-0.5 bg-sky-500 text-white rounded font-extrabold uppercase scale-90">Save 16%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription KPI Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Recurring Revenue (MRR)</p>
            <h3 className="text-3xl font-extrabold text-white font-mono flex items-center gap-0.5">
              <IndianRupee className="w-6 h-6 text-sky-500" />
              {(metrics?.mrr || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-2.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +18.4% monthly increase
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Annual Recurring Revenue (ARR)</p>
            <h3 className="text-3xl font-extrabold text-white font-mono flex items-center gap-0.5">
              <IndianRupee className="w-6 h-6 text-sky-500" />
              {(metrics?.arr || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-2.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Projected ARR Growth Stable
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Revenue Per Tenant (ARPU)</p>
            <h3 className="text-3xl font-extrabold text-white font-mono flex items-center gap-0.5">
              <IndianRupee className="w-6 h-6 text-sky-500" />
              {(metrics?.arpu || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-sky-400 font-bold mt-2.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Driven by Enterprise tier
            </p>
          </div>
        </div>
      )}

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:translate-y-[-2px] ${
                plan.popular ? "bg-[#0b101c]/90 border-sky-500/50 shadow-xl shadow-sky-500/5" : "bg-white/[0.02] border-white/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 px-4 py-1 text-[10px] font-extrabold uppercase rounded-bl-xl flex items-center gap-1 select-none">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  Most Popular
                </div>
              )}
              
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg shadow-black/40`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white font-mono flex items-center gap-0.5">
                    <IndianRupee className="w-5.5 h-5.5 text-sky-500" />
                    {price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                
                <div className="border-t border-white/5 my-6" />
                
                <ul className="space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Licenses Roster Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mt-8 shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-slate-950 to-transparent">
          <h3 className="text-lg font-bold text-white">Active Corporate Licenses</h3>
          <p className="text-xs text-slate-500 mt-1">Direct breakdown of tenant subscription tiers, billing schedules, and contracted monthly rates.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : !metrics?.licenses || metrics.licenses.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-semibold">
            No active corporate licenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* Desktop Table */}
            <table className="w-full text-left text-sm text-slate-300 border-collapse hidden md:table">
              <thead className="bg-white/5 text-slate-400 font-bold border-b border-white/5 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Corporate Tenant</th>
                  <th className="px-6 py-4">Subscription Tier</th>
                  <th className="px-6 py-4">Operational Status</th>
                  <th className="px-6 py-4">Next Renewal Cycle</th>
                  <th className="px-6 py-4 text-right">Contracted Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {metrics.licenses.map((lic: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-all duration-200">
                    <td className="px-6 py-4 font-bold text-white">
                      {lic.companyName || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        lic.planName === "Enterprise Plan" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        lic.planName === "Professional Plan" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {lic.planName || "Starter Plan"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {lic.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">{lic.renewalDate || "June 1, 2026"}</td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-white flex items-center justify-end gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                      {(lic.rate || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-white/[0.05]">
              {metrics.licenses.map((lic: any, idx: number) => (
                <div key={idx} className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm">{lic.companyName}</h4>
                    <span className="font-mono font-extrabold text-white text-sm flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                      {(lic.rate || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      lic.planName === "Enterprise Plan" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      lic.planName === "Professional Plan" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {lic.planName || "Starter Plan"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      {lic.status || "Active"}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                    <span>RENEWAL DATE</span>
                    <span className="text-slate-400 font-mono">{lic.renewalDate || "June 1, 2026"}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
