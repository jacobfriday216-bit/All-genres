import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Article, MonetagConfig, GoogleVerificationConfig, SiteSettings } from '../types';

export interface PublicSettingsPayload {
  siteSettings: SiteSettings;
  monetag: MonetagConfig & { verificationMetaTag?: string };
  googleVerification: { method: string; metaTag: string };
  dataSource: 'supabase' | 'local';
}

// Default initial settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'ALL GENRES',
  tagline: 'The Global Pulse of Music, Movies & Pop Culture',
  description: 'Premier entertainment news magazine covering music artists, Nollywood, Hollywood, celebrity biographies, movies, and pop culture.',
  contactEmail: 'jacobfriday216@gmail.com',
  socialLinks: {
    twitter: 'https://twitter.com/allgenresmedia',
    facebook: 'https://facebook.com/allgenresmedia',
    instagram: 'https://instagram.com/allgenresmedia',
    youtube: 'https://youtube.com/@allgenresmedia',
    tiktok: 'https://tiktok.com/@allgenresmedia'
  },
  visitorRegistrationEnabled: true,
  defaultOgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml'
};

export const DEFAULT_MONETAG_CONFIG: MonetagConfig = {
  smartLink: {
    enabled: false,
    url: '',
    title: 'Recommended For You',
    description: 'Exclusive entertainment stories and partner updates selected for ALL GENRES readers.',
    buttonText: 'Continue Reading',
    delaySeconds: 5,
    showOnHomepageOnly: false,
    allowDismiss: true,
    frequencyHours: 24
  },
  verification: {
    method: 'meta',
    metaTagCode: '',
    fileName: '',
    fileContent: ''
  },
  placements: {
    header: { enabled: false, code: '', label: 'Top Banner (Leaderboard 728x90)' },
    homepage: { enabled: false, code: '', label: 'Homepage Mid-Feed Banner' },
    sidebar: { enabled: false, code: '', label: 'Sidebar Sticky Ad (300x250)' },
    insideArticle: { enabled: false, code: '', label: 'In-Article Inline Story Ad' },
    afterArticle: { enabled: false, code: '', label: 'Post-Article Native Grid' },
    footer: { enabled: false, code: '', label: 'Footer Sponsor Banner' }
  }
};

export const DEFAULT_GOOGLE_CONFIG: GoogleVerificationConfig = {
  method: 'meta',
  metaTag: '',
  filename: '',
  fileContent: ''
};

// Helper: Maps Supabase row to Article interface
function mapRowToArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    slug: row.slug,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
    author: typeof row.author === 'string' ? JSON.parse(row.author) : (row.author || { name: 'Jacob Friday (Founder & Admin)', role: 'Senior Entertainment Editor' }),
    featuredImage: row.featured_image,
    caption: row.caption || '',
    status: row.status || 'published',
    publishedAt: row.published_at || new Date().toISOString(),
    scheduledFor: row.scheduled_for || undefined,
    views: Number(row.views || 0),
    readingTime: Number(row.reading_time || 4),
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    featured: Boolean(row.featured),
    breaking: Boolean(row.breaking),
    excerpt: row.excerpt || '',
    content: row.content || ''
  };
}

// Helper: Maps Article interface to Supabase row
function mapArticleToRow(art: Partial<Article>): any {
  const row: any = {
    updated_at: new Date().toISOString()
  };
  if (art.id !== undefined) row.id = art.id;
  if (art.title !== undefined) row.title = art.title;
  if (art.subtitle !== undefined) row.subtitle = art.subtitle;
  if (art.slug !== undefined) row.slug = art.slug;
  if (art.category !== undefined) row.category = art.category;
  if (art.tags !== undefined) row.tags = art.tags;
  if (art.author !== undefined) row.author = art.author;
  if (art.featuredImage !== undefined) row.featured_image = art.featuredImage;
  if (art.caption !== undefined) row.caption = art.caption;
  if (art.status !== undefined) row.status = art.status;
  if (art.publishedAt !== undefined) row.published_at = art.publishedAt;
  if (art.scheduledFor !== undefined) row.scheduled_for = art.scheduledFor;
  if (art.views !== undefined) row.views = art.views;
  if (art.readingTime !== undefined) row.reading_time = art.readingTime;
  if (art.seoTitle !== undefined) row.seo_title = art.seoTitle;
  if (art.seoDescription !== undefined) row.seo_description = art.seoDescription;
  if (art.featured !== undefined) row.featured = art.featured;
  if (art.breaking !== undefined) row.breaking = art.breaking;
  if (art.excerpt !== undefined) row.excerpt = art.excerpt;
  if (art.content !== undefined) row.content = art.content;
  return row;
}

export const dataService = {
  /**
   * Fetches articles. Visitors only receive published articles; admins can fetch all.
   */
  async getArticles(status: 'all' | 'published' | 'draft' | 'scheduled' = 'published', token?: string): Promise<Article[]> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false });

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase articles query error:', error.message);
        } else if (data && data.length > 0) {
          return data.map(mapRowToArticle);
        }
      } catch (err) {
        console.warn('Failed to query Supabase directly:', err);
      }
    }

    // Fallback to Express endpoint
    try {
      const url = status === 'all' ? '/api/articles?status=all' : `/api/articles?status=${status}`;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const d = await res.json();
        return d.articles || [];
      }
    } catch {}

    return [];
  },

  /**
   * Fetches single article by slug and increments its view count.
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          // Increment views
          supabase
            .from('articles')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id)
            .then(() => {});

          return mapRowToArticle({ ...data, views: (data.views || 0) + 1 });
        }
      } catch {}
    }

    // Fallback to Express endpoint
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (res.ok) {
        const d = await res.json();
        return d.article || null;
      }
    } catch {}

    return null;
  },

  /**
   * Saves (creates or updates) an article in the shared database.
   */
  async saveArticle(article: Partial<Article>, token: string): Promise<Article> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const row = mapArticleToRow(article);

      if (!row.id) {
        row.id = `art-${Date.now()}`;
        row.created_at = new Date().toISOString();
        if (!row.published_at) row.published_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('articles')
          .insert([row])
          .select()
          .single();

        if (error) throw new Error(error.message);
        return mapRowToArticle(data);
      } else {
        const { data, error } = await supabase
          .from('articles')
          .update(row)
          .eq('id', row.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return mapRowToArticle(data);
      }
    }

    // Fallback to Express API
    const isNew = !article.id;
    const endpoint = isNew ? '/api/articles' : `/api/articles/${article.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save article.');
    return data.article;
  },

  /**
   * Deletes an article from the shared database.
   */
  async deleteArticle(id: string, token: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    }

    const res = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  },

  /**
   * Fetches public site settings, Monetag, and Google verification.
   */
  async getPublicSettings(): Promise<PublicSettingsPayload> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value');

        if (data && data.length > 0) {
          const map = new Map(data.map((item: any) => [item.key, item.value]));
          const siteSettings = (map.get('siteSettings') as SiteSettings) || DEFAULT_SITE_SETTINGS;
          const monetag = (map.get('monetag') as MonetagConfig) || DEFAULT_MONETAG_CONFIG;
          const google = (map.get('googleVerification') as GoogleVerificationConfig) || DEFAULT_GOOGLE_CONFIG;

          return {
            siteSettings,
            monetag: {
              ...monetag,
              verificationMetaTag: monetag.verification?.metaTagCode
            },
            googleVerification: {
              method: google.method || 'meta',
              metaTag: google.metaTag || ''
            },
            dataSource: 'supabase'
          };
        }
      } catch (err) {
        console.warn('Failed to fetch settings from Supabase:', err);
      }
    }

    // Fallback to Express endpoint
    try {
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        const d = await res.json();
        return {
          ...d,
          dataSource: 'local'
        };
      }
    } catch {}

    return {
      siteSettings: DEFAULT_SITE_SETTINGS,
      monetag: {
        ...DEFAULT_MONETAG_CONFIG,
        verificationMetaTag: ''
      },
      googleVerification: {
        method: 'meta',
        metaTag: ''
      },
      dataSource: 'local'
    };
  },

  /**
   * Saves settings to Supabase or local Express backend.
   */
  async saveSetting(key: 'siteSettings' | 'monetag' | 'googleVerification', value: any, token: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);
      return true;
    }

    const endpointMap: Record<string, string> = {
      siteSettings: '/api/settings/site',
      monetag: '/api/settings/monetag',
      googleVerification: '/api/settings/google-verification'
    };

    const res = await fetch(endpointMap[key], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(value)
    });
    return res.ok;
  },

  /**
   * One-click database seed: pushes default 12 articles and settings into Supabase.
   */
  async seedInitialDataToSupabase(): Promise<{ success: boolean; message: string; count: number }> {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase is not configured yet. Please enter your project URL and Anon Key.');
    }

    // Try fetching existing local articles to seed
    let initialArticles: Article[] = [];
    try {
      const res = await fetch('/api/articles?status=all');
      if (res.ok) {
        const d = await res.json();
        initialArticles = d.articles || [];
      }
    } catch {}

    if (initialArticles.length === 0) {
      throw new Error('No articles found to seed. Make sure the application is running.');
    }

    // Upsert articles to Supabase
    const rows = initialArticles.map(mapArticleToRow);
    const { error: artError } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'id' });

    if (artError) {
      throw new Error(`Failed to seed articles: ${artError.message}`);
    }

    // Seed default settings
    await supabase.from('site_settings').upsert([
      { key: 'siteSettings', value: DEFAULT_SITE_SETTINGS, updated_at: new Date().toISOString() },
      { key: 'monetag', value: DEFAULT_MONETAG_CONFIG, updated_at: new Date().toISOString() },
      { key: 'googleVerification', value: DEFAULT_GOOGLE_CONFIG, updated_at: new Date().toISOString() }
    ], { onConflict: 'key' });

    return {
      success: true,
      message: `Successfully seeded ${initialArticles.length} articles and default site settings to Supabase!`,
      count: initialArticles.length
    };
  }
};
