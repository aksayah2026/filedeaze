import { Card, CardContent } from "@/components/ui/card";
import { useCustomers } from "../hooks/useCustomers";
import { User, Loader2, Mail, Phone, Calendar } from "lucide-react";

export function Customers() {
  const { data: customers, isLoading } = useCustomers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Customer Directory</h2>
          <p className="text-slate-400 mt-2">View and manage your service user base.</p>
        </div>
        <button className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customers?.map((customer) => (
          <Card key={customer.userId} className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] group hover:border-sky-500/40 transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <User className="w-6 h-6 text-sky-500" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Joined</span>
                    <span className="text-[11px] text-slate-300 font-semibold">
                      {customer.registrationDate || customer.createdDate
                        ? new Date(customer.registrationDate || customer.createdDate!).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-6 truncate">{customer.username}</h3>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-4 h-4 text-sky-500/60" />
                    <span className="text-xs font-medium truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-4 h-4 text-sky-500/60" />
                    <span className="text-xs font-medium">{customer.phoneNumber || customer.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 flex gap-2">
                <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all">
                  History
                </button>
                <button className="flex-1 py-2 bg-sky-500/10 hover:bg-sky-500/20 rounded-xl text-[10px] font-bold text-sky-500 transition-all">
                  Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!customers || customers.length === 0) && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500 font-medium text-lg">No customers registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
