import { useState, useEffect } from "react";
import { 
  Settings, Loader2, Save, RefreshCw, AlertTriangle, ShieldCheck, Mail, 
  Globe, Moon, Check, ToggleLeft, ToggleRight, Sparkles
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";
import { motion } from "framer-motion";

export function SuperSettings() {
  const [platformName, setPlatformName] = useState("FieldEaze Admin Console");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportEmail, setSupportEmail] = useState("support@fieldeaze.com");
  const [webhookUrl, setWebhookUrl] = useState("https://api.fieldeaze.com/webhooks/receiver");
  const [theme, setTheme] = useState("dark");
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await superAdminService.getSystemSettings();
      if (res.success && res.data) {
        setPlatformName(res.data.platformName || "");
        setMaintenanceMode(res.data.maintenanceMode || false);
        setSupportEmail(res.data.supportEmail || "");
        setWebhookUrl(res.data.webhookUrl || "");
        setTheme(res.data.theme || "dark");
        setSecurityAlerts(res.data.securityAlerts || false);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const payload = {
        platformName,
        maintenanceMode,
        supportEmail,
        webhookUrl,
        theme,
        securityAlerts
      };
      const res = await superAdminService.updateSystemSettings(payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg(res.message || "Failed to commit configuration");
      }
    } catch (error) {
      setErrorMsg("An unexpected network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-sky-500" />
            System Configurations
          </h2>
          <p className="text-slate-400 mt-1">Configure global parameters, security modules, system-wide maintenance locks, and API gateways.</p>
        </div>
        
        <button 
          onClick={fetchSettings}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all self-end sm:self-auto"
          title="Reload configurations"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Tuning platform relays...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Notifications */}
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Configurations committed successfully to system registry database!</span>
            </motion.div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Platform Parameters */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Globe className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Environment Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Branding Name</label>
                <input 
                  type="text" 
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all font-semibold"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Interface Theme</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-all font-semibold"
                  disabled={isSaving}
                >
                  <option value="dark">Vesper Obsidian Dark (Recommended)</option>
                  <option value="light">Solarized Daylight</option>
                  <option value="cyberpunk">Neon Terminal Green</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Platform Status Switches */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Hardlocks</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">System-Wide Maintenance Lock</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Activating this lock will immediately force all tenant administrators, technicians, and operations panels offline. Displays a maintenance screen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors shrink-0 text-slate-400 hover:text-white"
                disabled={isSaving}
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-12 h-12 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Webhooks & Alerts */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security Webhooks & Support Alerting</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global Platform Notification Email</label>
                  <input 
                    type="email" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all font-medium placeholder:text-slate-600"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Stream Auditor Webhook Target</label>
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all font-mono text-xs placeholder:text-slate-600"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Aggressive Security Breach Logs</h4>
                  <p className="text-slate-400 leading-relaxed font-medium">Forward suspicious auth failures and bypass audits immediately via global notification relays.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityAlerts(!securityAlerts)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors shrink-0 text-slate-400 hover:text-white"
                  disabled={isSaving}
                >
                  {securityAlerts ? (
                    <ToggleRight className="w-12 h-12 text-sky-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 px-6 py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-sky-500/10 transition-colors select-none"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving modifications...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save Configurations
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
