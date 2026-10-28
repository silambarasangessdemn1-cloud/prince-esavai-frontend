import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
} from 'lucide-react';

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Form state
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setUsername('');
    setPhoneNumber('');
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccessMessage('');
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsSubmitting(true);

    if (mode === 'signup') {
      const result = await signup(username.trim(), phoneNumber.trim(), password);
      setIsSubmitting(false);
      if (!result.success) {
        setError({ type: result.error || 'SIGNUP_FAILED', message: result.message || 'Signup failed.' });
      }
      // If successful, AuthContext will update isAuthenticated and App.tsx will redirect
    } else {
      const result = await login(phoneNumber.trim(), password);
      setIsSubmitting(false);
      if (!result.success) {
        setError({ type: result.error || 'LOGIN_FAILED', message: result.message || 'Login failed.' });
      }
    }
  };

  // Determine the icon & color to show based on error type
  const getErrorStyles = () => {
    if (!error) return null;
    switch (error.type) {
      case 'WRONG_PHONE_NUMBER':
        return { icon: <Phone className="w-4 h-4" />, color: 'bg-orange-50 border-orange-300 text-orange-800' };
      case 'WRONG_PASSWORD':
        return { icon: <Lock className="w-4 h-4" />, color: 'bg-red-50 border-red-300 text-red-800' };
      case 'PHONE_ALREADY_EXISTS':
        return { icon: <Phone className="w-4 h-4" />, color: 'bg-amber-50 border-amber-300 text-amber-800' };
      case 'NETWORK_ERROR':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-gray-50 border-gray-300 text-gray-800' };
      default:
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-50 border-red-300 text-red-800' };
    }
  };

  const errorStyles = getErrorStyles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Princess A to Z Business</h1>
          <p className="text-sm text-slate-500 mt-1">e-Sevai Service Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'text-emerald-700 bg-emerald-50/50 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'text-emerald-700 bg-emerald-50/50 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'login'
                  ? 'Enter your phone number and password to access your dashboard.'
                  : 'Register with your details to get started.'}
              </p>
            </div>

            {/* Error Alert */}
            {error && errorStyles && (
              <div
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-medium ${errorStyles.color} animate-[fadeIn_0.2s_ease-out]`}
              >
                <span className="mt-0.5 shrink-0">{errorStyles.icon}</span>
                <span>{error.message}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Username – signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Tamil Selvan"
                    required
                    minLength={3}
                    maxLength={30}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Allow digits and optional leading +
                    const val = e.target.value.replace(/[^0-9+]/g, '');
                    setPhoneNumber(val);
                    if (error?.type === 'WRONG_PHONE_NUMBER') setError(null);
                  }}
                  placeholder="e.g. 9876543210"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    error?.type === 'WRONG_PHONE_NUMBER'
                      ? 'border-orange-400 bg-orange-50/40 focus:ring-orange-500/30 focus:border-orange-400'
                      : 'border-slate-200 bg-slate-50/50 focus:ring-emerald-500/30 focus:border-emerald-400'
                  }`}
                />
              </div>
              {error?.type === 'WRONG_PHONE_NUMBER' && (
                <p className="mt-1 text-[11px] text-orange-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> No account found with this number
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error?.type === 'WRONG_PASSWORD') setError(null);
                  }}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    error?.type === 'WRONG_PASSWORD'
                      ? 'border-red-400 bg-red-50/40 focus:ring-red-500/30 focus:border-red-400'
                      : 'border-slate-200 bg-slate-50/50 focus:ring-emerald-500/30 focus:border-emerald-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error?.type === 'WRONG_PASSWORD' && (
                <p className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Incorrect password. Please try again.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Footer switch */}
          <div className="px-6 pb-5 text-center">
            <p className="text-xs text-slate-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Secured by Princess A to Z Business &bull; All rights reserved &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

