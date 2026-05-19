import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { customerApi } from "../api/customerApi";
import {
  User, Loader2, Mail, Phone, Search, Filter, Trash2,
  ShieldOff, ShieldCheck, ChevronLeft, ChevronRight,
  Download, Eye, X, Calendar, BookOpen, AlertTriangle,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
interface Customer {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  enabled: boolean;
  isDeleted?: boolean;
  registrationDate?: string;
  createdDate?: string;
  totalBookings?: number;
  activeRequests?: number;
}

interface DetailsPayload {
  profile: Customer;
  stats: { totalBookings: number; completedBookings: number; pendingBookings: number; cancelledBookings: number; totalSpent: number };
  bookings: any[];
  addresses: any[];
}

/* ────────────────────────────────────────────────────────────
   Helper: export customers array to CSV
──────────────────────────────────────────────────────────── */
function exportCsv(customers: Customer[]) {
  const headers = ["Name", "Email", "Phone", "Status", "Total Bookings", "Joined"];
  const rows = customers.map((c) => [
    `"${c.username}"`,
    `"${c.email}"`,
    `"${c.phoneNumber || c.phone || ""}"`,
    c.isDeleted ? "Deleted" : c.enabled ? "Active" : "Blocked",
    c.totalBookings ?? 0,
    c.registrationDate || c.createdDate || "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ────────────────────────────────────────────────────────────
   Status Badge
──────────────────────────────────────────────────────────── */
function StatusBadge({ customer }: { customer: Customer }) {
  if (customer.isDeleted)
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400">
        <XCircle className="w-3 h-3" /> Deleted
      </span>
    );
  if (!customer.enabled)
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
        <ShieldOff className="w-3 h-3" /> Blocked
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Customer Details Modal
──────────────────────────────────────────────────────────── */
function CustomerDetailsModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data: raw, isLoading } = useQuery(
    ["customer-details", customerId],
    () => customerApi.getDetails(customerId),
    { staleTime: 30_000 }
  );

  const details: DetailsPayload | null = useMemo(() => {
    try {
      const d = (raw as any)?.data ?? raw;
      return d ?? null;
    } catch { return null; }
  }, [raw]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Customer Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : details ? (
          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shrink-0">
                <User className="w-8 h-8 text-sky-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{details.profile?.username}</h3>
                <p className="text-slate-400 text-sm">{details.profile?.email}</p>
                <StatusBadge customer={details.profile} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total", value: details.stats?.totalBookings ?? 0, color: "text-white" },
                { label: "Completed", value: details.stats?.completedBookings ?? 0, color: "text-emerald-400" },
                { label: "Pending", value: details.stats?.pendingBookings ?? 0, color: "text-amber-400" },
                { label: "Cancelled", value: details.stats?.cancelledBookings ?? 0, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Total spent */}
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm text-slate-400 font-medium">Total Spent</span>
              <span className="text-lg font-bold text-sky-400">₹{(details.stats?.totalSpent ?? 0).toFixed(2)}</span>
            </div>

            {/* Recent Bookings */}
            {details.bookings && details.bookings.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-500" /> Recent Bookings
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {details.bookings.slice(0, 5).map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                      <span className="text-xs text-slate-300 truncate max-w-[200px]">{b.description || `Booking #${i + 1}`}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                        b.status === "CANCELLED" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">Unable to load details.</div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Confirm Dialog
──────────────────────────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold text-slate-300 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 rounded-2xl text-sm font-bold text-white transition-all">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Customers Page
──────────────────────────────────────────────────────────── */
const PAGE_SIZE = 12;

import { useNavigate } from "react-router-dom";

export function Customers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED" | "DELETED">("ACTIVE");
  const [page, setPage] = useState(0);

  // Modals
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "block" | "unblock"; id: string; name: string } | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const { data: raw, isLoading, error } = useQuery(
    ["customers", search, statusFilter, page],
    () => customerApi.getAll({
      name: search || undefined,
      enabled: statusFilter === "ACTIVE" ? true : statusFilter === "BLOCKED" ? false : undefined,
      page,
      size: PAGE_SIZE,
      sortBy: "createdDate",
      direction: "desc",
    }),
    { keepPreviousData: true }
  );

  const payload = useMemo(() => {
    try {
      const d = (raw as any)?.data ?? raw;
      return {
        content: (d?.content ?? (Array.isArray(d) ? d : [])) as Customer[],
        totalPages: d?.totalPages ?? 1,
        totalElements: d?.totalElements ?? 0,
      };
    } catch { return { content: [], totalPages: 1, totalElements: 0 }; }
  }, [raw]);

  // Client-side filter for DELETED tab (backend returns non-deleted by default)
  const customers = useMemo(() => {
    if (statusFilter === "DELETED") return payload.content.filter((c) => c.isDeleted);
    return payload.content;
  }, [payload.content, statusFilter]);

  // ── Mutations ──────────────────────────────────────────
  const deleteMut = useMutation((id: string) => customerApi.deleteCustomer(id), {
    onSuccess: () => { queryClient.invalidateQueries(["customers"]); setConfirmAction(null); },
  });

  const statusMut = useMutation(
    ({ id, enabled }: { id: string; enabled: boolean }) => customerApi.updateStatus(id, enabled),
    { onSuccess: () => { queryClient.invalidateQueries(["customers"]); setConfirmAction(null); } }
  );

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") deleteMut.mutate(confirmAction.id);
    else statusMut.mutate({ id: confirmAction.id, enabled: confirmAction.type === "unblock" });
  }, [confirmAction, deleteMut, statusMut]);

  const handleExport = () => exportCsv(customers);

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Modals */}
      {detailsId && <CustomerDetailsModal customerId={detailsId} onClose={() => setDetailsId(null)} />}
      {confirmAction && (
        <ConfirmDialog
          message={`Are you sure you want to ${confirmAction.type} "${confirmAction.name}"? ${
            confirmAction.type === "delete" ? "Booking history will be preserved." : ""
          }`}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Customer Directory</h2>
          <p className="text-slate-400 mt-1">
            {payload.totalElements.toLocaleString()} customer{payload.totalElements !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-[#0f172a]/60 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ACTIVE", "BLOCKED", "DELETED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(0); }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === f
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24 gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <span>Failed to load customers. Check API connection.</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <User className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-500 font-medium">No customers found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {customers.map((customer) => (
            <Card
              key={customer.userId}
              className={`bg-[#0f172a]/40 backdrop-blur-sm border rounded-[2.5rem] group transition-all duration-300 overflow-hidden ${
                customer.isDeleted
                  ? "border-red-500/10 opacity-60"
                  : customer.enabled
                  ? "border-white/5 hover:border-sky-500/30"
                  : "border-amber-500/20"
              }`}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shrink-0">
                      <User className="w-5 h-5 text-sky-500" />
                    </div>
                    <StatusBadge customer={customer} />
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-bold text-white mb-1 truncate">{customer.username}</h3>

                  {/* Email + Phone */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-sky-500/60 shrink-0" />
                      <span className="text-xs truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-sky-500/60 shrink-0" />
                      <span className="text-xs">{customer.phoneNumber || customer.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-sky-500/60 shrink-0" />
                      <span className="text-xs">
                        {(customer.registrationDate || customer.createdDate)
                          ? new Date(customer.registrationDate || customer.createdDate!).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Stats pills */}
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 bg-white/5 rounded-xl py-1.5 text-center border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">Bookings</p>
                      <p className="text-sm font-bold text-white">{customer.totalBookings ?? 0}</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl py-1.5 text-center border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">Active</p>
                      <p className="text-sm font-bold text-amber-400">{customer.activeRequests ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                {!customer.isDeleted && (
                  <div className="bg-white/[0.03] border-t border-white/5 px-4 py-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/customers/${customer.userId}`)}
                      title="View Details"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 rounded-xl text-[10px] font-bold text-sky-400 transition-all"
                    >
                      <Eye className="w-3 h-3" /> Details
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: customer.enabled ? "block" : "unblock",
                          id: customer.userId,
                          name: customer.username,
                        })
                      }
                      title={customer.enabled ? "Block" : "Unblock"}
                      className="flex items-center justify-center px-2.5 py-2 bg-white/5 hover:bg-amber-500/10 rounded-xl transition-all"
                    >
                      {customer.enabled
                        ? <ShieldOff className="w-3.5 h-3.5 text-amber-400" />
                        : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({ type: "delete", id: customer.userId, name: customer.username })
                      }
                      title="Delete"
                      className="flex items-center justify-center px-2.5 py-2 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {payload.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400 font-medium">
            Page <span className="text-white font-bold">{page + 1}</span> of{" "}
            <span className="text-white font-bold">{payload.totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(payload.totalPages - 1, p + 1))}
            disabled={page >= payload.totalPages - 1}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
