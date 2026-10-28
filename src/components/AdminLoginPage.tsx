import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  KeyRound,
} from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToCitizenPortal: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToCitizenPortal,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        // Also set standard token so existing API calls like aadhaarApi succeed
        localStorage.setItem('token', data.data.token);
        onLoginSuccess(data.data.token, data.data.user);
      } else {
        setErrorMessage(data.message || 'Invalid admin credentials.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Could not connect to the backend server. Make sure it is running on port 5001.');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#03231c] flex items-center justify-center p-4 selection:bg-[#00cba0] selection:text-slate-950 relative overflow-hidden"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Subtle radial glow background matching the portal's deep teal identity */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#00cba0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToCitizenPortal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300/80 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Citizen Portal</span>
        </button>

        {/* Card Box */}
        <div className="bg-[#053228] border border-[#094235] rounded-3xl shadow-2xl p-7 sm:p-9 space-y-6 text-white relative">
          {/* Top Brand / Shield */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00cba0] to-emerald-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-[#00cba0]/20">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Admin Control Center</h1>
            <p className="text-xs text-emerald-200/70 font-semibold">
              Separate administrative gateway for incoming request processing
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03231c] border border-[#0c4739] focus:border-[#00cba0] rounded-xl text-sm text-white placeholder:text-emerald-300/30 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5">
                Hardcoded Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#03231c] border border-[#0c4739] focus:border-[#00cba0] rounded-xl text-sm text-white placeholder:text-emerald-300/30 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-emerald-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credential Hint Card */}
            <div className="p-3 bg-[#03231c]/60 border border-[#094235] rounded-xl text-[11px] text-emerald-300/80 flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-[#00cba0] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Default Admin Credentials:</span>
                <div>Username: <strong className="text-[#00cba0] font-mono">admin</strong></div>
                <div>Password: <strong className="text-[#00cba0] font-mono">Admin@2026</strong></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00cba0] hover:bg-[#00b58e] text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-[#00cba0]/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Unlock Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-emerald-400/50">
          Princess A to Z Business • e-Governance Admin Access URL: <strong>/admin</strong>
        </p>
      </div>
    </div>
  );
};

