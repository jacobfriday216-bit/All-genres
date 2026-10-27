import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  UploadCloud,
  Check,
  Server,
  Globe,
  Key,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getSupabaseCredentials,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  getSqlMigrationScript,
  ADMIN_EMAIL
} from '../lib/supabase';
import { dataService } from '../services/dataService';

export const SupabaseManager: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    articleCount?: number;
    tablesFound?: boolean;
  } | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setAnonKey(creds.anonKey);
    setIsConfigured(isSupabaseConfigured());
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      setIsConfigured(isSupabaseConfigured());
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !anonKey.trim()) {
      alert('Please enter both Project URL and Anon Public Key.');
      return;
    }
    saveSupabaseCredentials(supabaseUrl.trim(), anonKey.trim());
    setIsConfigured(true);
    setSavedMessage('Credentials saved! Testing connection...');
    setTimeout(() => {
      setSavedMessage(null);
      handleTestConnection();
    }, 600);
  };

  const handleClearCredentials = () => {
    if (confirm('Clear saved Supabase credentials from this browser session?')) {
      clearSupabaseCredentials();
      setSupabaseUrl('');
      setAnonKey('');
      setIsConfigured(false);
      setTestResult(null);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await dataService.seedInitialDataToSupabase();
      setSeedResult(res);
      // Re-test to update count
      handleTestConnection();
    } catch (err: any) {
      setSeedResult({
        success: false,
        message: err.message || 'Seeding failed'
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleCopySql = () => {
    const sql = getSqlMigrationScript();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-800/40 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <Database className="w-3.5 h-3.5" />
            Shared Cloud Database Suite
          </div>
          <h1 className="text-2xl font-black text-white">Supabase Online Database Sync</h1>
          <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
            Connect both your <strong>Google AI Studio Preview</strong> and your <strong>Live Netlify Website</strong> to the same Supabase database. When you publish an article from this admin console, it appears automatically on the live ALL GENRES website without requiring another deployment!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition-colors"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Database Engine</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-bold text-sm text-white">
              {isConfigured ? 'Supabase Cloud (PostgreSQL)' : 'Local Preview Storage'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {isConfigured ? 'Live synchronization enabled across Netlify & Preview.' : 'Operating on local dev environment. Connect to sync with Netlify.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Authorized Owner Account</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 truncate">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{ADMIN_EMAIL}</span>
          </div>
          <p className="text-[11px] text-zinc-400">Protected by Supabase Row Level Security (RLS).</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Netlify Deployment State</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-blue-400">
            <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Real-Time Cloud Sync</span>
          </div>
          <p className="text-[11px] text-zinc-400">Zero redeployments needed for new published articles.</p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Supabase Project API Credentials
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Obtain these from your Supabase Dashboard: <strong>Project Settings → API</strong>
            </p>
          </div>

          {isConfigured && (
            <button
              type="button"
              onClick={handleClearCredentials}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        {savedMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Project URL (<code className="text-emerald-400">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Anon Public API Key (<code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Safe for browser clients. All operations are strictly guarded by Row Level Security for {ADMIN_EMAIL}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Save Credentials & Connect
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !supabaseUrl || !anonKey}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{testing ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>
          </div>
        </form>

        {/* Test Result Callout */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/60 border-amber-800 text-amber-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{testResult.success ? 'Supabase Connection Verified!' : 'Connection Notice'}</p>
              <p className="text-zinc-300 leading-relaxed">{testResult.message}</p>
              {testResult.success && (
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Articles in Cloud Database: {testResult.articleCount ?? 0}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* One-Click Seeding Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-400" />
              One-Click Cloud Database Seeding
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instantly push all default articles (Afrobeats, Nollywood, Hollywood, Celebrity Biographies) and site settings to your Supabase project.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding || !isConfigured}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md self-start sm:self-auto"
          >
            <Sparkles className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Database...' : 'Seed Supabase DB'}</span>
          </button>
        </div>

        {seedResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              seedResult.success
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                : 'bg-red-950/70 border-red-800 text-red-200'
            }`}
          >
            {seedResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{seedResult.message}</span>
          </div>
        )}
      </div>

      {/* SQL Migration Script Generator */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Supabase SQL Schema & Row Level Security (RLS)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Run this in your Supabase project: <strong>SQL Editor → New Query → Run</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy SQL Script</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 max-h-64 overflow-y-auto leading-relaxed">
            {getSqlMigrationScript()}
          </pre>
        </div>
      </div>

      {/* Step-by-Step Netlify Setup Walkthrough */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          Step-by-Step Instructions: Connect Netlify to Shared Supabase Database
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              STEP 1: Create Supabase Project
            </span>
            <p className="text-zinc-300">
              Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">supabase.com</a>, create a free project named <strong>all-genres-media</strong>, and choose your preferred database region.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              STEP 2: Run SQL Schema
            </span>
            <p className="text-zinc-300">
              In Supabase, navigate to <strong>SQL Editor</strong>, paste the copied SQL script from above, and click <strong>Run</strong>. This creates the <code className="text-emerald-300">articles</code>, <code className="text-emerald-300">site_settings</code>, and <code className="text-emerald-300">media</code> tables with Row Level Security.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              STEP 3: Create Admin Account
            </span>
            <p className="text-zinc-300">
              In Supabase, open <strong>Authentication → Users</strong> and click <strong>Add User → Create user</strong>. Enter <strong>{ADMIN_EMAIL}</strong> and your chosen password. Check "Auto Confirm User".
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              STEP 4: Add Netlify Environment Variables
            </span>
            <p className="text-zinc-300">
              In Netlify, go to <strong>Site configuration → Environment variables</strong> and add:
            </p>
            <ul className="space-y-1 font-mono text-[10px] text-zinc-400">
              <li>• <span className="text-emerald-300">VITE_SUPABASE_URL</span> = (your project URL)</li>
              <li>• <span className="text-emerald-300">VITE_SUPABASE_ANON_KEY</span> = (your anon key)</li>
              <li>• <span className="text-emerald-300">ADMIN_EMAIL</span> = {ADMIN_EMAIL}</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-200">
          <strong>Automatic Sync Guarantee:</strong> Because both this Google AI Studio console and Netlify share the exact same Supabase database, whenever you publish, edit, or delete an article from the admin console, the changes appear on your live Netlify website instantaneously without needing a redeploy!
        </div>
      </div>
    </div>
  );
};
