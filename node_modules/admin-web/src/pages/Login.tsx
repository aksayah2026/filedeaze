import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] Already authenticated, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      console.log('[Login] Submitting credentials...');
      await authService.login({ email: email.trim(), password });
      console.log('[Login] Login successful, navigating to /');
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (error: any) {
      const msg = error.message || 'Login failed. Please try again.';
      console.error('[Login] Login error:', msg);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-sky-500/10 border border-sky-500/20 mb-6">
            <ShieldCheck className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">FieldEaze Admin</h1>
          <p className="text-slate-400 font-medium">Enterprise Management Portal</p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fieldeaze.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Inline error message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Forgot password? Contact system administrator.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
