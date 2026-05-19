import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { customerApi } from "../api/customerApi";
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { extractApiData } from "@/lib/utils";

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: raw, isLoading, error } = useQuery(
    ["customer-details", id],
    () => customerApi.getDetails(id as string),
    { enabled: !!id }
  );

  const details = extractApiData(raw) || (raw as any)?.data?.data || (raw as any)?.data || raw;
  
  console.log("CustomerDetails route param ID:", id);
  console.log("CustomerDetails raw API response:", raw);
  console.log("CustomerDetails mapped details:", details);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <h2 className="text-xl font-bold text-white">Customer not found</h2>
        <button onClick={() => navigate("/customers")} className="text-sky-500 hover:underline">
          Go back to customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <button
        onClick={() => navigate("/customers")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customers</span>
      </button>

      <Card className="bg-[#0f172a]/60 backdrop-blur-sm border-white/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shrink-0">
              <User className="w-12 h-12 text-sky-500" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{details.profile?.username || details.username}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {details.profile?.email || details.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {details.profile?.phoneNumber || details.phoneNumber || details.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: details.totalBookings ?? details.stats?.totalBookings ?? 0, color: "text-sky-400" },
              { label: "Completed", value: details.completedBookings ?? details.stats?.completedBookings ?? 0, color: "text-emerald-400" },
              { label: "Pending", value: details.activeBookings ?? details.pendingBookings ?? details.stats?.pendingBookings ?? 0, color: "text-amber-400" },
              { label: "Total Spent", value: `₹${((details.totalSpent ?? details.stats?.totalSpent) || 0).toFixed(2)}`, color: "text-purple-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {details.bookings && details.bookings.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-500" /> Booking History
              </h3>
              <div className="space-y-3">
                {details.bookings.map((booking: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Booking #{booking.id || index + 1}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-300">₹{booking.totalAmount || 0}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
