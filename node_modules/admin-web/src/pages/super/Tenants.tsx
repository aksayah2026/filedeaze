import { useState, useEffect } from "react";
import { 
  Building2, Search, Plus, Edit, Trash, CheckCircle2, XCircle, 
  Loader2, Sparkles, User, Calendar, ShieldCheck, AlertCircle, X
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import { motion, AnimatePresence } from "framer-motion";

export function Tenants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Starter Plan");
  const [status, setStatus] = useState("Active");

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getAllTenants();
      if (res.success) {
        setTenants(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedTenant(null);
    setCompanyName("");
    setSubscriptionPlan("Starter Plan");
    setStatus("Active");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant: any) => {
    setModalType("edit");
    setSelectedTenant(tenant);
    setCompanyName(tenant.companyName || "");
    setSubscriptionPlan(tenant.subscriptionPlan || "Starter Plan");
    setStatus(tenant.status || "Active");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenDelete = (tenant: any) => {
    setSelectedTenant(tenant);
    setDeleteConfirmName("");
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      if (modalType === "create") {
        const payload = {
          companyName,
          subscriptionPlan,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`,
          status
        };
        const res = await superAdminService.createTenant(payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchTenants();
        } else {
          setErrorMsg(res.message || "Failed to create tenant");
        }
      } else {
        const payload = {
          ...selectedTenant,
          companyName,
          subscriptionPlan,
          status
        };
        const res = await superAdminService.updateTenant(selectedTenant.tenantId, payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchTenants();
        } else {
          setErrorMsg(res.message || "Failed to update tenant");
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== selectedTenant.companyName) {
      setErrorMsg("Confirmation company name does not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await superAdminService.deleteTenant(selectedTenant.tenantId);
      if (res.success) {
        setIsDeleteOpen(false);
        fetchTenants();
      } else {
        setErrorMsg(res.message || "Failed to delete tenant");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.tenantId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-8 h-8 text-sky-500" />
            Tenant Management
          </h2>
          <p className="text-slate-400 mt-1">Provision corporate tenants, toggle service statuses, and view dynamic roster metrics.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 font-bold text-sm select-none"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search corporate tenants by name or UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Table or Card List depending on responsive view */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Fetching tenant rosters...</p>
          </div>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-lg">No tenants matching criteria</p>
          <p className="text-slate-500 text-sm mt-1">Try refining your search keyword or create a new client tenant.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="bg-white/5 text-slate-400 font-bold border-b border-white/5 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Corporate Tenant</th>
                    <th className="px-6 py-4">Tenant UUID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Subscription Plan</th>
                    <th className="px-6 py-4">Active Users</th>
                    <th className="px-6 py-4">Provisioned Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.tenantId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                            {tenant.companyName?.substring(0, 2).toUpperCase() || "TN"}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{tenant.companyName || "N/A"}</span>
                            <span className="text-xs text-slate-500">Corporate client</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 select-all">
                        {tenant.tenantId}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          tenant.status === "Active" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                          {tenant.status || "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          tenant.subscriptionPlan === "Enterprise Plan" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : tenant.subscriptionPlan === "Professional Plan"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {tenant.subscriptionPlan || "Starter Plan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold font-mono text-white">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {tenant.usersCount ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "--"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(tenant)}
                            className="p-2 bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/10 rounded-xl transition-all text-slate-400"
                            title="Edit Tenant"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(tenant)}
                            className="p-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 rounded-xl transition-all text-slate-400"
                            title="Delete Tenant"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredTenants.map((tenant) => (
              <div 
                key={tenant.tenantId} 
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 hover:bg-white/[0.03] transition-colors relative"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    {tenant.companyName?.substring(0, 2).toUpperCase() || "TN"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate text-base">{tenant.companyName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block truncate select-all">{tenant.tenantId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider mb-1">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tenant.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${tenant.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {tenant.status || "Inactive"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider mb-1">Plan</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      tenant.subscriptionPlan === "Enterprise Plan" 
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                        : tenant.subscriptionPlan === "Professional Plan"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {tenant.subscriptionPlan?.replace(" Plan", "") || "Starter"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider mb-1">Active Users</span>
                    <div className="flex items-center gap-1 text-white font-bold font-mono">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {tenant.usersCount ?? 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider mb-1">Provisioned</span>
                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "--"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/5 justify-end">
                  <button 
                    onClick={() => handleOpenEdit(tenant)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 border border-white/10 rounded-xl transition-all text-slate-400 text-xs font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleOpenDelete(tenant)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 rounded-xl transition-all text-slate-400 text-xs font-bold"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create & Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c101a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 to-transparent">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-500" />
                    {modalType === "create" ? "Provision Client Tenant" : "Modify Tenant Parameters"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {modalType === "create" ? "Setup and activate a brand new company portal." : "Change corporate licensing tiers & active statuses."}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSave} className="p-6 space-y-5">
                
                {errorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Company Name</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Industries Ltd"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-medium placeholder:text-slate-600"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Subscription Plan</label>
                  <select 
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-all font-medium"
                    disabled={isSubmitting}
                  >
                    <option value="Starter Plan">Starter Plan (₹1,999/mo)</option>
                    <option value="Professional Plan">Professional Plan (₹4,999/mo)</option>
                    <option value="Enterprise Plan">Enterprise Plan (₹14,999/mo)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Operational Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("Active")}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-black/20 border-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Suspended")}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        status === "Suspended"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-black/20 border-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                      disabled={isSubmitting}
                    >
                      <XCircle className="w-4 h-4" />
                      Suspended
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20 -mx-6 -mb-6 p-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors select-none"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-sky-500/10 transition-colors select-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {modalType === "create" ? "Provision Portal" : "Commit Changes"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0c101a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-slate-950 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trash className="w-5 h-5 text-rose-500" />
                    Terminate Tenant License?
                  </h3>
                  <p className="text-xs text-rose-400 mt-1 font-medium">Warning: This action is irreversible.</p>
                </div>
                <button 
                  onClick={() => setIsDeleteOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                    {errorMsg}
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Deleting <strong className="text-white">{selectedTenant?.companyName}</strong> will permanently suspend the company workspace and disable access for all its associated administrators and field technicians.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Type <strong className="text-slate-300 select-all font-mono">{selectedTenant?.companyName}</strong> to confirm:
                  </label>
                  <input 
                    type="text" 
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder="Enter corporate tenant name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-700"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20 -mx-6 -mb-6 p-6">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors select-none"
                    disabled={isSubmitting}
                  >
                    Keep License
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-rose-600/10 transition-colors select-none disabled:opacity-40"
                    disabled={isSubmitting || deleteConfirmName !== selectedTenant?.companyName}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Terminating...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Terminate Workspace
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
