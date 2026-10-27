import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article } from '../types';

export const ADMIN_EMAIL = 'jacobfriday216@gmail.com';

// Local storage keys for user-configured credentials (useful for runtime setup on Netlify/Preview)
const STORAGE_URL_KEY = 'allgenres_supabase_url';
const STORAGE_KEY_KEY = 'allgenres_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

/**
 * Retrieves the Supabase project URL and anon public key.
 * Prioritizes environment variables, with fallback to saved localStorage.
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const storedUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '').trim();

  const url = envUrl || storedUrl;
  const anonKey = envKey || storedKey;

  return { url, anonKey };
}

/**
 * Checks if Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
}

/**
 * Returns a configured SupabaseClient or null if credentials are not provided.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'allgenres_supabase_auth_token'
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Saves Supabase credentials to localStorage and re-initializes client.
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  cachedClient = null;
}

/**
 * Clears saved Supabase credentials from localStorage.
 */
export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

/**
 * Tests live connection to Supabase database.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  articleCount?: number;
  tablesFound?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials missing. Please provide your Project URL and Anon Key.'
    };
  }

  try {
    const { data, count, error } = await client
      .from('articles')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      // Check if table does not exist
      if (error.code === '42P01' || error.message.includes('relation "articles" does not exist')) {
        return {
          success: false,
          tablesFound: false,
          message: 'Connected to Supabase project, but the "articles" table has not been created yet. Run the SQL Migration Script below.'
        };
      }
      return {
        success: false,
        message: `Database error (${error.code || 'unknown'}): ${error.message}`
      };
    }

    return {
      success: true,
      tablesFound: true,
      articleCount: count ?? data?.length ?? 0,
      message: `Successfully connected to Supabase database! Found ${count ?? data?.length ?? 0} articles.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection attempt failed: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Generates the complete SQL migration script to paste into Supabase SQL Editor.
 */
export function getSqlMigrationScript(): string {
  return `-- ====================================================================
-- ALL GENRES ENTERTAINMENT WEBSITE - SUPABASE DATABASE SCHEMA & POLICIES
-- Target Admin: ${ADMIN_EMAIL}
-- Run this in your Supabase project > SQL Editor > New Query
-- ====================================================================

-- 1. Create Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  author JSONB DEFAULT '{"name": "Jacob Friday (Founder & Admin)", "role": "Senior Entertainment Editor"}'::jsonb,
  featured_image TEXT NOT NULL,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  views BIGINT DEFAULT 0,
  reading_time INTEGER DEFAULT 4,
  seo_title TEXT,
  seo_description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  breaking BOOLEAN DEFAULT FALSE,
  excerpt TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

-- 2. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Media Table
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  type TEXT DEFAULT 'image/jpeg',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Articles:
-- Visitors can view published articles
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles"
ON public.articles FOR SELECT
USING (status = 'published');

-- Administrator has full access (read drafts, create, edit, delete, unpublish)
DROP POLICY IF EXISTS "Admin full access to articles" ON public.articles;
CREATE POLICY "Admin full access to articles"
ON public.articles FOR ALL
USING (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}')
WITH CHECK (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}');

-- Also allow public to increment article views atomically
DROP POLICY IF EXISTS "Public can increment views" ON public.articles;
CREATE POLICY "Public can increment views"
ON public.articles FOR UPDATE
USING (status = 'published')
WITH CHECK (status = 'published');

-- 6. RLS Policies for Site Settings:
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin full access to site settings" ON public.site_settings;
CREATE POLICY "Admin full access to site settings"
ON public.site_settings FOR ALL
USING (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}')
WITH CHECK (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}');

-- 7. RLS Policies for Media:
DROP POLICY IF EXISTS "Public can view media" ON public.media;
CREATE POLICY "Public can view media"
ON public.media FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin full access to media" ON public.media;
CREATE POLICY "Admin full access to media"
ON public.media FOR ALL
USING (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}')
WITH CHECK (auth.jwt() ->> 'email' = '${ADMIN_EMAIL}');

-- ====================================================================
-- Schema setup completed!
-- Now create an Auth User in Supabase Authentication:
-- Email: ${ADMIN_EMAIL}
-- ====================================================================
`;
}
