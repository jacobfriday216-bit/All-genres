import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Settings,
  Sparkles,
  DollarSign,
  Search,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Save,
  Clock,
  Upload,
  Globe,
  Radio,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sliders,
  X,
  Menu,
  Layers,
  Filter
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { SmartLinkModal } from '../components/SmartLinkModal';
import { ArticleEditor } from '../components/ArticleEditor';
import { FullArticlePreview } from '../components/FullArticlePreview';
import { CategoryManager } from '../components/CategoryManager';
import { Article, MonetagConfig, GoogleVerificationConfig, SiteSettings, User, AdminStats } from '../types';

interface AdminDashboardProps {
  token: string;
  adminUser: { email: string; name: string; role: string };
  onLogout: () => void;
  onViewSite: () => void;
}

type TabType =
  | 'overview'
  | 'articles'
  | 'media'
  | 'categories'
  | 'smartlink'
  | 'monetag'
  | 'google'
  | 'seo'
  | 'settings'
  | 'users'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUser,
  onLogout,
  onViewSite
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [monetagConfig, setMonetagConfig] = useState<MonetagConfig | null>(null);
  const [googleConfig, setGoogleConfig] = useState<GoogleVerificationConfig | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Article Editor & Preview State
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [previewArticleData, setPreviewArticleData] = useState<Partial<Article> | null>(null);
  const [smartLinkPreviewOpen, setSmartLinkPreviewOpen] = useState(false);

  // Mobile Navigation Drawer & Filters State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [articleFilterCategory, setArticleFilterCategory] = useState<string>('all');
  const [articleFilterStatus, setArticleFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');

  // Google & Monetag Test Results
  const [googleTestResult, setGoogleTestResult] = useState<{ verified: boolean; message: string; url?: string } | null>(null);
  const [monetagTestResult, setMonetagTestResult] = useState<{ verified: boolean; message: string; url?: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, [token]);

  // Synchronize Tab, Editor, and Preview with Browser Navigation & History
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin/')) {
        const sub = path.replace('/admin/', '');
        if (sub === 'articles/new') {
          handleOpenCreateArticle(false);
        } else if (sub.startsWith('articles/edit/')) {
          const id = sub.replace('articles/edit/', '');
          const found = articles.find((a) => a.id === id);
          if (found) {
            handleOpenEditArticle(found, false);
          }
        } else if (sub === 'preview') {
          // Keep preview active if data exists
        } else {
          setActiveTab(sub as TabType);
          setEditingArticle(null);
          setPreviewArticleData(null);
        }
      } else if (path === '/admin') {
        setActiveTab('overview');
        setEditingArticle(null);
        setPreviewArticleData(null);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  const switchTab = (tab: TabType, pushState = true) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setEditingArticle(null);
    setPreviewArticleData(null);
    if (pushState && window.location.pathname !== `/admin/${tab}`) {
      window.history.pushState({}, '', `/admin/${tab}`);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load Stats & Overview
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentLogs(statsData.recentLogs || []);
        setRegisteredUsers(statsData.users || []);
      }

      // Load All Articles (including drafts & scheduled)
      const artsRes = await fetch('/api/articles?status=all', { headers });
      if (artsRes.ok) {
        const artsData = await artsRes.json();
        setArticles(artsData.articles || []);
      }

      // Load Media
      const mediaRes = await fetch('/api/media', { headers });
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaList(mediaData.media || []);
      }

      // Load Full Settings
      const setRes = await fetch('/api/settings/admin', { headers });
      if (setRes.ok) {
        const setData = await setRes.json();
        setMonetagConfig(setData.monetag);
        setGoogleConfig(setData.googleVerification);
        setSiteSettings(setData.siteSettings);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('Saving changes...');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/settings/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          siteSettings,
          monetag: monetagConfig,
          googleVerification: googleConfig
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save settings');
      }

      setSaveStatus('Settings updated and persisted successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setSaveStatus(null);
    }
  };

  // Article Publishing Handlers
  const handleOpenCreateArticle = (pushState = true) => {
    setIsNewArticle(true);
    setEditingArticle({
      title: '',
      subtitle: '',
      slug: '',
      category: 'Music',
      tags: [],
      content: '',
      excerpt: '',
      featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      caption: '',
      status: 'published',
      scheduledFor: '',
      author: {
        name: adminUser.name || 'Jacob Friday (Founder & Admin)',
        role: 'Senior Entertainment Editor'
      },
      featured: false,
      breaking: false,
      seoTitle: '',
      seoDescription: ''
    });
    setPreviewArticleData(null);
    if (pushState) {
      window.history.pushState({}, '', '/admin/articles/new');
    }
  };

  const handleOpenCreateArticleWithCategory = (catName: string) => {
    setIsNewArticle(true);
    setEditingArticle({
      title: '',
      subtitle: '',
      slug: '',
      category: catName as any,
      tags: [catName],
      content: '',
      excerpt: '',
      featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      caption: '',
      status: 'published',
      scheduledFor: '',
      author: {
        name: adminUser.name || 'Jacob Friday (Founder & Admin)',
        role: 'Senior Entertainment Editor'
      },
      featured: false,
      breaking: false,
      seoTitle: '',
      seoDescription: ''
    });
    setPreviewArticleData(null);
    window.history.pushState({}, '', '/admin/articles/new');
  };

  const handleOpenEditArticle = (art: Article, pushState = true) => {
    setIsNewArticle(false);
    setEditingArticle({ ...art });
    setPreviewArticleData(null);
    if (pushState) {
      window.history.pushState({}, '', `/admin/articles/edit/${art.id}`);
    }
  };

  const handleOpenPreviewArticle = (art: Partial<Article>) => {
    setPreviewArticleData(art);
    window.history.pushState({}, '', '/admin/preview');
  };

  const handleCloseEditor = () => {
    setEditingArticle(null);
    setPreviewArticleData(null);
    if (window.location.pathname !== '/admin/articles') {
      window.history.pushState({}, '', '/admin/articles');
    }
  };

  const handleClosePreview = () => {
    setPreviewArticleData(null);
    if (editingArticle) {
      window.history.pushState(
        {},
        '',
        isNewArticle ? '/admin/articles/new' : `/admin/articles/edit/${editingArticle.id}`
      );
    } else {
      window.history.pushState({}, '', '/admin/articles');
    }
  };

  const handleSaveArticleFromEditor = async (
    articleData: Partial<Article>,
    targetStatus: 'published' | 'draft' | 'scheduled'
  ) => {
    const isCreate = isNewArticle || !articleData.id;
    const endpoint = isCreate ? '/api/articles' : `/api/articles/${articleData.id || editingArticle?.id}`;
    const method = isCreate ? 'POST' : 'PUT';

    const payload = {
      ...articleData,
      status: targetStatus,
      publishedAt:
        targetStatus === 'published' && (!articleData.publishedAt || articleData.status === 'draft')
          ? new Date().toISOString()
          : articleData.publishedAt || new Date().toISOString()
    };

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save article');
    }

    const data = await res.json();
    if (isCreate) {
      setArticles((prev) => [data.article, ...prev]);
    } else {
      setArticles((prev) => prev.map((a) => (a.id === data.article.id ? data.article : a)));
    }

    setEditingArticle(null);
    await loadAllData();

    const msg =
      targetStatus === 'published'
        ? 'Article successfully published to live website!'
        : targetStatus === 'draft'
        ? 'Article saved as draft successfully!'
        : 'Article scheduled for future publication!';
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.content) {
      alert('Please provide title and content.');
      return;
    }

    try {
      const endpoint = isNewArticle ? '/api/articles' : `/api/articles/${editingArticle.id}`;
      const method = isNewArticle ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingArticle)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save article');
      }

      const data = await res.json();
      if (isNewArticle) {
        setArticles([data.article, ...articles]);
      } else {
        setArticles(articles.map((a) => (a.id === data.article.id ? data.article : a)));
      }

      setEditingArticle(null);
      await loadAllData();
      setSaveStatus('Article successfully published and updated on website!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch {}
  };

  // Media File Upload Handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList([data.media, ...mediaList]);
      }
    } catch (err) {
      alert('Upload failed: ' + err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMediaList(mediaList.filter((m) => m.id !== id));
      }
    } catch {}
  };

  // Google Test Handler
  const handleTestGoogle = async () => {
    try {
      const res = await fetch('/api/settings/test-google', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setGoogleTestResult(data);
    } catch (err: any) {
      setGoogleTestResult({ verified: false, message: err.message });
    }
  };

  // Monetag Test Handler
  const handleTestMonetag = async () => {
    try {
      const res = await fetch('/api/settings/test-monetag', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMonetagTestResult(data);
    } catch (err: any) {
      setMonetagTestResult({ verified: false, message: err.message });
    }
  };

  // 1. DEDICATED FULL-SCREEN PUBLIC ARTICLE PREVIEW
  if (previewArticleData) {
    return (
      <FullArticlePreview
        article={previewArticleData}
        onBack={handleClosePreview}
        onPublish={async () => {
          await handleSaveArticleFromEditor(previewArticleData, 'published');
          handleClosePreview();
        }}
        relatedArticles={articles}
      />
    );
  }

  // 2. DEDICATED FULL-SCREEN ARTICLE PUBLISHING WORKSPACE
  if (editingArticle) {
    return (
      <ArticleEditor
        article={editingArticle}
        isNew={isNewArticle}
        mediaList={mediaList}
        onClose={handleCloseEditor}
        onSave={handleSaveArticleFromEditor}
        onPreview={(data) => handleOpenPreviewArticle(data)}
        token={token}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* MOBILE STICKY ADMIN APP BAR (< md) */}
      <div className="md:hidden sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
          <div>
            <Logo size="sm" light showTagline={false} />
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mt-0.5">
              Section: <span className="text-red-400 capitalize">{activeTab}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenCreateArticle(true)}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={onViewSite}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            title="View Public Website"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <Logo size="sm" light showTagline={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 px-1 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">{adminUser.name}</span> ·{' '}
              <span className="text-red-400 font-bold uppercase">Master Admin</span>
            </div>

            <nav className="space-y-1 mt-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => switchTab('overview')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard Overview
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('articles')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'articles'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  Articles & Publishing
                </span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                  {articles.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('media')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5" />
                  Media Library
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('categories')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Manage Categories
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('smartlink')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'smartlink'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Pop-up & Smart Link
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('monetag')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'monetag'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Monetag Ads & Verify
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('google')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'google'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-400" />
                  Google Search Console
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('seo')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'seo'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                  SEO & Sitemap XML
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('settings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Website Settings
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('users')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  Visitor Registration
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => switchTab('security')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Audit & Security
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onViewSite();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>View Public Website</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950 hover:bg-red-950 text-xs font-bold text-red-400 border border-zinc-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION (hidden md:flex) */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col justify-between flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Identity */}
          <div className="p-5 border-b border-zinc-800">
            <Logo size="sm" light showTagline={false} />
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate max-w-[150px] font-medium">{adminUser.email}</span>
              <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                MASTER
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('articles')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Articles & Publishing</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('media')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media Library</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Manage Categories</span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              Monetization & Ads
            </div>

            <button
              type="button"
              onClick={() => switchTab('smartlink')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'smartlink'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pop-up & Smart Link</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('monetag')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'monetag'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Monetag Ads & Verify</span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              SEO & Integrations
            </div>

            <button
              type="button"
              onClick={() => switchTab('google')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Google Search Console</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('seo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span>SEO & Sitemap XML</span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              System & Community
            </div>

            <button
              type="button"
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Visitor Registration</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Audit & Security</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            type="button"
            onClick={onViewSite}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-950 hover:bg-red-950 text-xs font-semibold text-red-400 hover:text-red-300 border border-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Global Action Notices */}
        {saveStatus && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveStatus}</span>
            </div>
            <button onClick={() => setSaveStatus(null)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">ALL GENRES Executive Overview</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Real-time editorial metrics, database records, monetization toggles, and traffic metrics.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllData}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenCreateArticle(true)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Article</span>
                </button>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Published Articles
                </span>
                <p className="text-3xl font-black text-white mt-1">{stats.publishedCount}</p>
                <span className="text-[11px] text-emerald-400 mt-1 inline-block">
                  Live on public feeds
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Total Article Reads
                </span>
                <p className="text-3xl font-black text-amber-400 mt-1">
                  {stats.totalViews.toLocaleString()}
                </p>
                <span className="text-[11px] text-zinc-400 mt-1 inline-block">Across all categories</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Drafts & Scheduled
                </span>
                <p className="text-3xl font-black text-zinc-200 mt-1">
                  {stats.draftCount + stats.scheduledCount}
                </p>
                <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                  {stats.draftCount} drafts · {stats.scheduledCount} scheduled
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Registered Members
                </span>
                <p className="text-3xl font-black text-blue-400 mt-1">
                  {stats.totalRegisteredUsers}
                </p>
                <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                  {siteSettings?.visitorRegistrationEnabled ? 'Signups Active' : 'Signups Paused'}
                </span>
              </div>
            </div>

            {/* Quick Status Bar for Monetag and Google */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Monetag Smart Link Pop-up
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {monetagConfig?.smartLink?.enabled
                      ? `Active (URL: ${monetagConfig.smartLink.url || 'Not set'})`
                      : 'Currently Disabled'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('smartlink')}
                  className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Configure →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    Google Search Console
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Method: {googleConfig?.method ? googleConfig.method.toUpperCase() : 'None configured'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('google')}
                  className="text-xs font-bold text-blue-400 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Verify Ownership →
                </button>
              </div>
            </div>

            {/* Recent Articles Table */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Recent Articles</h3>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  View All ({articles.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Title</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Views</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {articles.slice(0, 5).map((art) => (
                      <tr key={art.id} className="hover:bg-zinc-800/30">
                        <td className="py-3 font-semibold text-zinc-200 max-w-xs truncate pr-4">
                          {art.title}
                        </td>
                        <td className="py-3 text-red-400 uppercase font-bold">{art.category}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              art.status === 'published'
                                ? 'bg-emerald-950 text-emerald-300'
                                : art.status === 'scheduled'
                                ? 'bg-blue-950 text-blue-300'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">{art.views.toLocaleString()}</td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenPreviewArticle(art)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                            title="Preview Public Article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditArticle(art)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARTICLES & PUBLISHING TAB */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Articles & Publishing Suite</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Create, edit, schedule, and optimize stories across all entertainment genres.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateArticle(true)}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    placeholder="Search articles by title, subtitle, author..."
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  {articleSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setArticleSearchQuery('')}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={articleFilterCategory}
                    onChange={(e) => setArticleFilterCategory(e.target.value)}
                    className="px-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="all">All Categories</option>
                    <option value="Music">Music</option>
                    <option value="Musicians">Musicians</option>
                    <option value="Movies">Movies</option>
                    <option value="Actors">Actors</option>
                    <option value="Nollywood">Nollywood</option>
                    <option value="Hollywood">Hollywood</option>
                    <option value="Celebrity News">Celebrity News</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setArticleFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    articleFilterStatus === 'all'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({articles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilterStatus('published')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    articleFilterStatus === 'published'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                      : 'text-zinc-400 hover:text-emerald-400'
                  }`}
                >
                  Published ({articles.filter((a) => a.status === 'published').length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilterStatus('draft')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    articleFilterStatus === 'draft'
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Drafts ({articles.filter((a) => a.status === 'draft').length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilterStatus('scheduled')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    articleFilterStatus === 'scheduled'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/80'
                      : 'text-zinc-400 hover:text-blue-400'
                  }`}
                >
                  Scheduled ({articles.filter((a) => a.status === 'scheduled').length})
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3">Article</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Reads</th>
                      <th className="py-3">Published</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {articles
                      .filter((art) => {
                        if (articleFilterStatus !== 'all' && art.status !== articleFilterStatus) return false;
                        if (
                          articleFilterCategory !== 'all' &&
                          art.category.toLowerCase().trim() !== articleFilterCategory.toLowerCase().trim()
                        )
                          return false;
                        if (articleSearchQuery.trim()) {
                          const q = articleSearchQuery.toLowerCase().trim();
                          return (
                            art.title.toLowerCase().includes(q) ||
                            (art.subtitle || '').toLowerCase().includes(q) ||
                            art.category.toLowerCase().includes(q) ||
                            (art.author?.name || '').toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((art) => (
                        <tr key={art.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 pr-4 max-w-sm">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.featuredImage}
                                alt=""
                                className="w-12 h-10 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                              />
                              <div>
                                <p className="font-bold text-zinc-200 line-clamp-1">{art.title}</p>
                                <p className="text-[11px] text-zinc-500 font-normal">
                                  By {art.author.name} · {art.readingTime} min read
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-red-400 uppercase font-bold text-[11px]">
                            {art.category}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                art.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : art.status === 'scheduled'
                                  ? 'bg-blue-950 text-blue-300'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {art.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-zinc-400">{art.views.toLocaleString()}</td>
                          <td className="py-3.5 text-zinc-400">
                            {new Date(art.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPreviewArticle(art)}
                              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              title="Preview Public Article"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditArticle(art, true)}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2.5 CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <CategoryManager
            articles={articles}
            onSelectCategoryFilter={(catName) => {
              setArticleFilterCategory(catName);
              switchTab('articles');
            }}
            onOpenCreateArticleWithCategory={(catName) => {
              handleOpenCreateArticleWithCategory(catName);
            }}
          />
        )}

        {/* 3. MEDIA LIBRARY TAB */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Media Assets & Uploads</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload article cover images, celebrity portraits, and verification assets.
                </p>
              </div>

              <label className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md">
                <Upload className="w-4 h-4" />
                <span>Upload New Media</span>
                <input
                  type="file"
                  onChange={handleMediaUpload}
                  accept="image/*,.html"
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map((med) => (
                <div
                  key={med.id}
                  className="group relative rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm"
                >
                  <div className="aspect-video w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                    {med.type?.startsWith('image') || med.url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                      <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-8 h-8 text-zinc-500" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-white truncate">{med.name}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(med.url);
                          alert('Media URL copied: ' + med.url);
                        }}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(med.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. POP-UP & MONETAG SMART LINK SETTINGS TAB */}
        {activeTab === 'smartlink' && monetagConfig && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Pop-up & Smart Link Settings</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage your Monetag Smart Link pop-up dialog without modifying source code.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSmartLinkPreviewOpen(true)}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Interactive Preview</span>
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Settings */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                {/* Enable / Disable Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Enable Smart Link Pop-Up</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Toggle whether the Monetag Smart Link pop-up appears to visitors.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monetagConfig.smartLink.enabled}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          smartLink: { ...monetagConfig.smartLink, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                  </label>
                </div>

                {/* Smart Link URL Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Monetag Smart Link URL
                  </label>
                  <p className="text-[11px] text-zinc-500 mb-2">
                    Paste the direct Smart Link destination provided by Monetag (e.g., https://otourwo.com/4/...)
                  </p>
                  <input
                    type="url"
                    placeholder="https://your-monetag-smartlink-url.com/..."
                    value={monetagConfig.smartLink.url}
                    onChange={(e) =>
                      setMonetagConfig({
                        ...monetagConfig,
                        smartLink: { ...monetagConfig.smartLink, url: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Title & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Pop-Up Modal Title
                    </label>
                    <input
                      type="text"
                      value={monetagConfig.smartLink.title}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          smartLink: { ...monetagConfig.smartLink, title: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Custom Action Button Label
                    </label>
                    <input
                      type="text"
                      value={monetagConfig.smartLink.buttonText}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          smartLink: { ...monetagConfig.smartLink, buttonText: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Pop-Up Description Text
                  </label>
                  <textarea
                    rows={3}
                    value={monetagConfig.smartLink.description}
                    onChange={(e) =>
                      setMonetagConfig({
                        ...monetagConfig,
                        smartLink: { ...monetagConfig.smartLink, description: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                {/* Appearance Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Delay Before Appears (sec)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={monetagConfig.smartLink.delaySeconds}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          smartLink: {
                            ...monetagConfig.smartLink,
                            delaySeconds: parseInt(e.target.value, 10) || 5
                          }
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Frequency Cap (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={monetagConfig.smartLink.frequencyHours}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          smartLink: {
                            ...monetagConfig.smartLink,
                            frequencyHours: parseInt(e.target.value, 10) || 24
                          }
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={monetagConfig.smartLink.showOnHomepageOnly}
                        onChange={(e) =>
                          setMonetagConfig({
                            ...monetagConfig,
                            smartLink: {
                              ...monetagConfig.smartLink,
                              showOnHomepageOnly: e.target.checked
                            }
                          })
                        }
                        className="rounded border-zinc-700 bg-zinc-950 text-red-600 focus:ring-0"
                      />
                      <span className="text-xs text-zinc-300 font-semibold">Homepage only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sidebar Guide */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Monetag Integration Rules
                  </h4>
                  <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      When no Smart Link URL is entered, the pop-up automatically stays disabled so visitors never see broken links.
                    </li>
                    <li>
                      The modal includes frequency caps so visitors are not repeatedly bombarded on every refresh.
                    </li>
                    <li>
                      Visitors can dismiss the pop-up unless disabled.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. MONETAG ADS & WEBSITE VERIFICATION TAB */}
        {activeTab === 'monetag' && monetagConfig && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Monetag Ads & Website Verification</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage official Monetag verification and ad banner placements across the website.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>

            {/* PART A: MONETAG WEBSITE VERIFICATION */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Part A: Monetag Website Verification</h3>
                </div>
                <button
                  onClick={handleTestMonetag}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-emerald-400 border border-zinc-700 cursor-pointer"
                >
                  Test Verification Reachability
                </button>
              </div>

              {monetagTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    monetagTestResult.verified
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                      : 'bg-red-950/80 border border-red-800 text-red-200'
                  }`}
                >
                  {monetagTestResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{monetagTestResult.message}</span>
                </div>
              )}

              <p className="text-xs text-zinc-400 leading-relaxed">
                When Monetag asks you to verify your website domain, choose the method provided by Monetag (HTML file or meta tag). The server will serve it instantly without code editing.
              </p>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="monetagMethod"
                    value="none"
                    checked={monetagConfig.verification.method === 'none'}
                    onChange={() =>
                      setMonetagConfig({
                        ...monetagConfig,
                        verification: { ...monetagConfig.verification, method: 'none' }
                      })
                    }
                  />
                  <span>No verification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="monetagMethod"
                    value="meta"
                    checked={monetagConfig.verification.method === 'meta'}
                    onChange={() =>
                      setMonetagConfig({
                        ...monetagConfig,
                        verification: { ...monetagConfig.verification, method: 'meta' }
                      })
                    }
                  />
                  <span>Meta Tag Method</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="monetagMethod"
                    value="file"
                    checked={monetagConfig.verification.method === 'file'}
                    onChange={() =>
                      setMonetagConfig({
                        ...monetagConfig,
                        verification: { ...monetagConfig.verification, method: 'file' }
                      })
                    }
                  />
                  <span>HTML File Method</span>
                </label>
              </div>

              {monetagConfig.verification.method === 'meta' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Monetag Verification Meta Tag
                  </label>
                  <input
                    type="text"
                    placeholder='e.g. <meta name="monetag-site-verification" content="xyz123" /> or token'
                    value={monetagConfig.verification.metaTagCode}
                    onChange={(e) =>
                      setMonetagConfig({
                        ...monetagConfig,
                        verification: { ...monetagConfig.verification, metaTagCode: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              {monetagConfig.verification.method === 'file' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Monetag File Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. monetag_verification.html"
                      value={monetagConfig.verification.fileName}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          verification: { ...monetagConfig.verification, fileName: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Monetag File Content
                    </label>
                    <input
                      type="text"
                      placeholder="Paste content of the verification file"
                      value={monetagConfig.verification.fileContent}
                      onChange={(e) =>
                        setMonetagConfig({
                          ...monetagConfig,
                          verification: { ...monetagConfig.verification, fileContent: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PART B: MONETAG AD PLACEMENTS */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Part B: Monetag Ad Placements</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage individual ad scripts. Note: Empty placements never display blank boxes.
                </p>
              </div>

              <div className="space-y-6">
                {(
                  [
                    { key: 'header', label: '1. Header Advertisement (Above Content)' },
                    { key: 'homepage', label: '2. Homepage Advertisement (In-Feed Billboard)' },
                    { key: 'sidebar', label: '3. Sidebar Advertisement (Desktop Sticky Unit)' },
                    { key: 'insideArticle', label: '4. Advertisement Inside Articles (Between Paragraphs)' },
                    { key: 'afterArticle', label: '5. Advertisement After Article (Below Story)' },
                    { key: 'footer', label: '6. Footer Advertisement (Above Legal Footer)' }
                  ] as const
                ).map(({ key, label }) => {
                  const item = monetagConfig.placements[key];
                  return (
                    <div key={key} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item?.enabled || false}
                            onChange={(e) =>
                              setMonetagConfig({
                                ...monetagConfig,
                                placements: {
                                  ...monetagConfig.placements,
                                  [key]: { ...item, enabled: e.target.checked }
                                }
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Paste Monetag Ad Code / Script
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Paste official Monetag ad tag or script code here..."
                          value={item?.code || ''}
                          onChange={(e) =>
                            setMonetagConfig({
                              ...monetagConfig,
                              placements: {
                                ...monetagConfig.placements,
                                [key]: { ...item, code: e.target.value }
                              }
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-emerald-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. GOOGLE SEARCH CONSOLE VERIFICATION TAB */}
        {activeTab === 'google' && googleConfig && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Google Search Console Verification</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Verify ownership of ALL GENRES with Google without touching website source code.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestGoogle}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-blue-400 border border-zinc-700 cursor-pointer"
                >
                  Test Verification Reachability
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>

            {googleTestResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  googleTestResult.verified
                    ? 'bg-blue-950/80 border border-blue-800 text-blue-200'
                    : 'bg-red-950/80 border border-red-800 text-red-200'
                }`}
              >
                {googleTestResult.verified ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span>{googleTestResult.message}</span>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Select Google Search Console Verification Method
                </label>
                <div className="flex items-center gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="googleMethod"
                      value="meta"
                      checked={googleConfig.method === 'meta'}
                      onChange={() => setGoogleConfig({ ...googleConfig, method: 'meta' })}
                    />
                    <span className="font-semibold text-white">HTML Meta Tag Method (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="googleMethod"
                      value="file"
                      checked={googleConfig.method === 'file'}
                      onChange={() => setGoogleConfig({ ...googleConfig, method: 'file' })}
                    />
                    <span className="font-semibold text-white">HTML File Upload Method</span>
                  </label>
                </div>
              </div>

              {/* Meta Tag Method Form */}
              {googleConfig.method === 'meta' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Google HTML Verification Meta Tag
                  </label>
                  <p className="text-xs text-zinc-400">
                    In Google Search Console, select <strong>HTML tag</strong>. Copy the tag (e.g., <code>&lt;meta name="google-site-verification" content="..." /&gt;</code>) and paste it below.
                  </p>
                  <input
                    type="text"
                    placeholder='<meta name="google-site-verification" content="your_verification_string" />'
                    value={googleConfig.metaTag}
                    onChange={(e) => setGoogleConfig({ ...googleConfig, metaTag: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-xl text-blue-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* HTML File Upload Method Form */}
              {googleConfig.method === 'file' && (
                <div className="space-y-4 pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-400">
                    In Google Search Console, select <strong>HTML file</strong>. Enter the exact filename and file content provided by Google. The backend will immediately serve it at the exact root path.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Google Filename (e.g. google4b81c2d9a.html)
                      </label>
                      <input
                        type="text"
                        placeholder="google1234567890abcdef.html"
                        value={googleConfig.filename}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, filename: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Google File Content
                      </label>
                      <input
                        type="text"
                        placeholder="google-site-verification: google1234567890abcdef.html"
                        value={googleConfig.fileContent}
                        onChange={(e) => setGoogleConfig({ ...googleConfig, fileContent: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-sm font-bold text-white mb-3">
                How to Complete Verification in Google Search Console
              </h3>
              <ol className="text-xs text-zinc-300 space-y-2.5 list-decimal pl-4 leading-relaxed">
                <li>
                  Go to{' '}
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline font-bold"
                  >
                    Google Search Console
                  </a>{' '}
                  and add your website URL prefix.
                </li>
                <li>
                  Under "Other verification methods", choose <strong>HTML tag</strong> or <strong>HTML file</strong>.
                </li>
                <li>
                  Copy the verification tag or filename into this panel and click <strong>Save Configuration</strong>.
                </li>
                <li>
                  Click <strong>Test Verification Reachability</strong> above to confirm ALL GENRES is serving it.
                </li>
                <li>
                  Return to Google Search Console and click <strong>VERIFY</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* 7. SEO & SITEMAP TAB */}
        {activeTab === 'seo' && siteSettings && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Search Engine Optimization (SEO)</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage meta titles, XML sitemaps, robots.txt directives, and OpenGraph defaults.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save SEO Config</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Live XML Sitemap</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Dynamically lists all published stories and categories.
                    </p>
                  </div>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    View /sitemap.xml <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Live robots.txt</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Controls search crawler indexing permissions.
                    </p>
                  </div>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    View /robots.txt <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Robots.txt Content
                </label>
                <textarea
                  rows={4}
                  value={siteSettings.robotsTxt}
                  onChange={(e) => setSiteSettings({ ...siteSettings, robotsTxt: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Default Social Share Preview Image (og:image)
                </label>
                <input
                  type="url"
                  value={siteSettings.defaultOgImage}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, defaultOgImage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. WEBSITE SETTINGS TAB */}
        {activeTab === 'settings' && siteSettings && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Website Settings</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Brand name, mission statement, contact email, and social profiles.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, siteName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contact & Editorial Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tagline / Masthead Motto
                </label>
                <input
                  type="text"
                  value={siteSettings.tagline}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={siteSettings.description}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Social Media Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      value={siteSettings.socialLinks.twitter}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          socialLinks: { ...siteSettings.socialLinks, twitter: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={siteSettings.socialLinks.instagram}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          socialLinks: { ...siteSettings.socialLinks, instagram: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. VISITOR REGISTRATION & USER MANAGEMENT TAB */}
        {activeTab === 'users' && siteSettings && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Visitor Registration & Users</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Control optional visitor registration and inspect registered readers.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Setting</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
              {/* Toggle switch for registration */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Allow Public Visitor Registration</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    When disabled, visitors can still read all articles freely without being prompted to sign up.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.visitorRegistrationEnabled}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        visitorRegistrationEnabled: e.target.checked
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>

              {/* Registered Members Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Registered Members ({registeredUsers.length})
                </h4>
                {registeredUsers.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-6 bg-zinc-950 rounded-xl text-center">
                    No visitors have registered accounts yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                          <th className="py-2.5">Name</th>
                          <th className="py-2.5">Email</th>
                          <th className="py-2.5">Role</th>
                          <th className="py-2.5">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {registeredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-800/30">
                            <td className="py-2.5 font-semibold text-white">{u.name}</td>
                            <td className="py-2.5 text-zinc-400">{u.email}</td>
                            <td className="py-2.5 text-amber-400 uppercase font-bold text-[10px]">
                              {u.role}
                            </td>
                            <td className="py-2.5 text-zinc-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 10. SECURITY & AUDIT LOG TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Security & Audit Activity</h1>
            <p className="text-xs text-zinc-400 -mt-4">
              Real-time audit log of administrative actions, authentication timestamps, and system health.
            </p>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Audit Trail
                </h4>
                <span className="text-xs text-zinc-500">Last 10 actions</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {recentLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-zinc-200">{log.action}</p>
                      {log.details && (
                        <p className="text-zinc-400 text-[11px] mt-0.5">{log.details}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()} ·{' '}
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SMART LINK PREVIEW MODAL */}
        {smartLinkPreviewOpen && monetagConfig && (
          <SmartLinkModal
            config={monetagConfig.smartLink}
            isHomepage={true}
            isPreview={true}
          />
        )}
      </main>
    </div>
  );
};
