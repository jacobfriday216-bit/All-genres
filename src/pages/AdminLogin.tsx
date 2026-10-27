import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { authService } from '../services/authService';
import {
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  ADMIN_EMAIL
} from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: { email: string; name: string; role: string }) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'setup' | 'forgot'>('login');

  // Supabase Connection drawer
  const [supabaseDrawerOpen, setSupabaseDrawerOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
    loadSupabaseCreds();
  }, []);

  const loadSupabaseCreds = () => {
    const creds = getSupabaseCredentials();
    setSupabaseUrlInput(creds.url);
    setSupabaseKeyInput(creds.anonKey);
    setSupabaseConnected(isSupabaseConfigured());
  };

  const checkStatus = async () => {
    try {
      const status = await authService.checkStatus();
      setAdminEmail(status.adminEmail || ADMIN_EMAIL);
      setEmailInput(status.adminEmail || ADMIN_EMAIL);
      if (!status.isConfigured && status.provider === 'local') {
        setMode('setup');
      } else {
        setMode('login');
      }
    } catch {
      setMode('login');
    }
  };

  const handleTestOrSaveSupabase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSupabaseStatusMsg('Please enter both Supabase Project URL and Anon Public Key.');
      return;
    }
    saveSupabaseCredentials(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setTestingSupabase(true);
    setSupabaseStatusMsg('Connecting to Supabase...');
    try {
      const res = await testSupabaseConnection();
      if (res.success) {
        setSupabaseConnected(true);
        setSupabaseStatusMsg('Connected to Supabase! Shared online database is active.');
      } else {
        setSupabaseStatusMsg(res.message);
      }
    } catch (err: any) {
      setSupabaseStatusMsg(err.message || 'Connection failed');
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.setupAdmin(password);
      setSuccessMsg('Master administrator password established successfully! Entering console...');
      setTimeout(() => {
        onLoginSuccess(res.token, res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(emailInput.trim(), password);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(emailInput.trim());
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" light showTagline={false} />
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Executive Admin Control
            </div>

            <button
              type="button"
              onClick={() => setSupabaseDrawerOpen(!supabaseDrawerOpen)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                supabaseConnected
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{supabaseConnected ? 'Supabase Online' : 'Connect Cloud DB'}</span>
              {supabaseDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Supabase Connection Drawer (Collapsible) */}
        {supabaseDrawerOpen && (
          <div className="mb-4 p-5 rounded-2xl bg-zinc-900 border border-emerald-800/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase Online Database Connection
              </h3>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Use the same Supabase project on both Google AI Studio Preview and Netlify so that published articles sync in real-time across both environments.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                  Project URL (<code className="text-emerald-300">VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="url"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                  Anon Key (<code className="text-emerald-300">VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestOrSaveSupabase}
                  disabled={testingSupabase}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${testingSupabase ? 'animate-spin' : ''}`} />
                  <span>{testingSupabase ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>

              {supabaseStatusMsg && (
                <p className="text-[11px] text-zinc-300 pt-1 leading-snug">
                  {supabaseStatusMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Card Box */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'setup' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-black text-white">Master Account Initial Setup</h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Welcome, <strong>{adminEmail}</strong>. Since this is your first time accessing the ALL GENRES console, please establish your personal administrator password.
                </p>
              </div>

              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="email"
                      disabled
                      value={emailInput}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Create Master Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter strong password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Confirm Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Securing Account...' : 'Save Password & Enter Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-black text-white">Administrator Sign In</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Authenticate as <strong>{adminEmail}</strong> to publish articles, configure Monetag, verify Google Search Console, and manage site settings.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={ADMIN_EMAIL}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying Credentials...' : 'Sign In to Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white">Administrator Account Recovery</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                As the designated master owner (<strong>{adminEmail}</strong>), request a secure password reset link to your email.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {loading ? 'Sending Instructions...' : `Send Password Reset Link to ${adminEmail}`}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Return to ALL GENRES Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
