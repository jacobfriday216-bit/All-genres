import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SEOHead } from './components/SEOHead';
import { SmartLinkModal } from './components/SmartLinkModal';
import { PolicyView, PolicyType } from './pages/PolicyView';
import { VisitorAuthModal } from './components/VisitorAuthModal';
import { SearchDialog } from './components/SearchDialog';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './pages/HomeView';
import { CategoryView } from './pages/CategoryView';
import { ArticleDetailView } from './pages/ArticleDetailView';
import { SearchView } from './pages/SearchView';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { Article, MonetagConfig, SiteSettings, User } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'article' | 'search' | 'admin' | 'policy'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType>('about');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [publicSettings, setPublicSettings] = useState<{
    siteSettings: SiteSettings;
    monetag: MonetagConfig & { verificationMetaTag?: string };
    googleVerification: { method: string; metaTag: string };
  } | null>(null);

  // Authentication States
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('allgenres_admin_token'));
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [visitorAuthOpen, setVisitorAuthOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global keyboard shortcut for instant search (e.g. '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && activeTag !== 'input' && activeTag !== 'textarea') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL on load (supports deep linking: /admin, /category/:slug, /article/:slug)
  useEffect(() => {
    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleUrlRouting = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentView('admin');
    } else if (path.startsWith('/category/')) {
      const cat = path.replace('/category/', '');
      setSelectedCategory(cat);
      setCurrentView('category');
    } else if (path.startsWith('/article/')) {
      const slug = path.replace('/article/', '');
      setSelectedArticleSlug(slug);
      setCurrentView('article');
    } else if (path.startsWith('/search')) {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('q') || '');
      setCurrentView('search');
    } else if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(path)) {
      const pol = path.replace('/', '') as PolicyType;
      setSelectedPolicyType(pol);
      setCurrentView('policy');
    } else {
      setCurrentView('home');
      setSelectedCategory('all');
    }
  };

  const navigateTo = (view: 'home' | 'category' | 'article' | 'search' | 'admin' | 'policy', param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);

    let newPath = '/';
    if (view === 'admin') {
      newPath = '/admin';
    } else if (view === 'category' && param) {
      setSelectedCategory(param);
      newPath = `/category/${param}`;
    } else if (view === 'article' && param) {
      setSelectedArticleSlug(param);
      newPath = `/article/${param}`;
    } else if (view === 'search' && param) {
      setSearchQuery(param);
      newPath = `/search?q=${encodeURIComponent(param)}`;
    } else if (view === 'policy' && param) {
      setSelectedPolicyType(param as PolicyType);
      newPath = `/${param}`;
    } else {
      setSelectedCategory('all');
      setSelectedArticleSlug(null);
    }

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // Fetch Public Settings & Articles
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [settingsData, arts] = await Promise.all([
        dataService.getPublicSettings(),
        dataService.getArticles('published')
      ]);

      if (settingsData) {
        setPublicSettings(settingsData);
      }
      setArticles(arts);

      // Check current user session if token exists
      const savedToken = localStorage.getItem('allgenres_admin_token');
      if (savedToken) {
        const admin = await authService.getCurrentUser(savedToken);
        if (admin) {
          setCurrentUser(admin as any);
          setAdminUser(admin);
          setAdminToken(savedToken);
        }
      }
    } catch (err) {
      console.error('Failed to initialize app data:', err);
    } finally {
      setLoading(false);
    }
  };

  // When article slug changes, fetch or locate article
  useEffect(() => {
    if (selectedArticleSlug) {
      const found = articles.find((a) => a.slug === selectedArticleSlug || a.id === selectedArticleSlug);
      if (found) {
        setCurrentArticle(found);
      }
      dataService.getArticleBySlug(selectedArticleSlug).then((art) => {
        if (art) {
          setCurrentArticle(art);
        }
      }).catch(() => {});
    }
  }, [selectedArticleSlug, articles]);

  const handleAdminLoginSuccess = (token: string, user: { email: string; name: string; role: string }) => {
    localStorage.setItem('allgenres_admin_token', token);
    setAdminToken(token);
    setAdminUser(user);
    setCurrentUser(user as User);
    setCurrentView('admin');
  };

  const handleAdminLogout = async () => {
    await authService.logout();
    setAdminToken(null);
    setAdminUser(null);
    setCurrentUser(null);
    navigateTo('home');
  };

  const handleVisitorAuthSuccess = (user: User, token: string) => {
    localStorage.setItem('allgenres_visitor_token', token);
    setCurrentUser(user);
  };

  const breakingArticle = articles.find((a) => a.breaking) || articles[0];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* SEO & Meta Tags Manager */}
      <SEOHead
        title={
          currentView === 'article' && currentArticle
            ? currentArticle.seoTitle || `${currentArticle.title} - ALL GENRES`
            : currentView === 'category'
            ? `${selectedCategory.toUpperCase()} News & Features - ALL GENRES`
            : currentView === 'policy'
            ? `${(selectedPolicyType || 'Legal').toUpperCase()} - ALL GENRES`
            : publicSettings?.siteSettings?.siteName
            ? `${publicSettings.siteSettings.siteName} - ${publicSettings.siteSettings.tagline}`
            : 'ALL GENRES - Entertainment News, Music, Movies & Pop Culture'
        }
        description={
          currentView === 'article' && currentArticle
            ? currentArticle.seoDescription || currentArticle.excerpt
            : publicSettings?.siteSettings?.description ||
              'Premier entertainment news magazine covering music artists, Nollywood, Hollywood, celebrity biographies, movies, and pop culture.'
        }
        article={currentView === 'article' && currentArticle ? currentArticle : undefined}
        googleMetaTag={publicSettings?.googleVerification?.metaTag}
        monetagMetaTag={publicSettings?.monetag?.verificationMetaTag}
      />

      {/* Monetag Smart Link Pop-up Modal */}
      {currentView !== 'admin' && currentView !== 'policy' && publicSettings?.monetag?.smartLink && (
        <SmartLinkModal
          config={publicSettings.monetag.smartLink}
          isHomepage={currentView === 'home'}
        />
      )}

      {/* Main Header (Hidden in Admin Dashboard and Policy Dedicated Pages) */}
      {currentView !== 'admin' && currentView !== 'policy' && (
        <Header
          currentCategory={selectedCategory}
          onSelectCategory={(cat) => {
            if (cat === 'all') {
              navigateTo('home');
            } else {
              navigateTo('category', cat);
            }
          }}
          onSearch={(query) => navigateTo('search', query)}
          onGoHome={() => navigateTo('home')}
          onOpenAdmin={() => navigateTo('admin')}
          onOpenAuth={() => setVisitorAuthOpen(true)}
          currentUser={currentUser}
          onLogout={handleAdminLogout}
          visitorRegistrationEnabled={publicSettings?.siteSettings?.visitorRegistrationEnabled ?? true}
          breakingArticle={breakingArticle ? { title: breakingArticle.title, slug: breakingArticle.slug } : undefined}
          onSelectArticle={(slug) => navigateTo('article', slug)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
        />
      )}

      {/* VIEW SWITCHER */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomeView
            articles={articles}
            monetag={publicSettings?.monetag}
            onSelectArticle={(slug) => navigateTo('article', slug)}
            onSelectCategory={(cat) => navigateTo('category', cat)}
          />
        )}

        {currentView === 'category' && (
          <CategoryView
            categorySlug={selectedCategory}
            categoryName={selectedCategory.replace(/-/g, ' ')}
            articles={articles.filter(
              (a) => a.category.toLowerCase().replace(/ /g, '-') === selectedCategory
            )}
            monetag={publicSettings?.monetag}
            onSelectArticle={(slug) => navigateTo('article', slug)}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'article' && currentArticle && (
          <ArticleDetailView
            article={currentArticle}
            relatedArticles={articles.filter(
              (a) => a.category === currentArticle.category && a.id !== currentArticle.id
            )}
            monetag={publicSettings?.monetag}
            onSelectCategory={(cat) => navigateTo('category', cat)}
            onSelectArticle={(slug) => navigateTo('article', slug)}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            initialQuery={searchQuery}
            articles={articles}
            monetag={publicSettings?.monetag}
            onSelectArticle={(slug) => navigateTo('article', slug)}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'policy' && (
          <PolicyView
            type={selectedPolicyType}
            onGoHome={() => navigateTo('home')}
            contactEmail={publicSettings?.siteSettings?.contactEmail || 'jacobfriday216@gmail.com'}
          />
        )}

        {currentView === 'admin' && (
          adminToken && adminUser ? (
            <AdminDashboard
              token={adminToken}
              adminUser={adminUser}
              onLogout={handleAdminLogout}
              onViewSite={() => navigateTo('home')}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToSite={() => navigateTo('home')}
            />
          )
        )}
      </div>

      {/* Main Footer (Hidden in Admin Dashboard and Policy Dedicated Pages) */}
      {currentView !== 'admin' && currentView !== 'policy' && publicSettings?.siteSettings && (
        <Footer
          settings={publicSettings.siteSettings}
          onSelectCategory={(cat) => navigateTo('category', cat)}
          onOpenPolicy={(type) => navigateTo('policy', type || 'about')}
          onOpenAdmin={() => navigateTo('admin')}
        />
      )}

      {/* Optional Visitor Auth Modal */}
      <VisitorAuthModal
        isOpen={visitorAuthOpen}
        onClose={() => setVisitorAuthOpen(false)}
        onSuccess={handleVisitorAuthSuccess}
      />

      {/* Search Dialog Modal */}
      <SearchDialog
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        articles={articles}
        onSelectArticle={(slug) => navigateTo('article', slug)}
        onFullSearch={(query) => navigateTo('search', query)}
      />

      {/* Android & Mobile Bottom Navigation Bar (Hidden in Admin & Full Policy Workspace) */}
      {currentView !== 'admin' && currentView !== 'policy' && (
        <MobileBottomNav
          currentCategory={selectedCategory}
          onSelectCategory={(cat) => {
            if (cat === 'all') {
              navigateTo('home');
            } else {
              navigateTo('category', cat);
            }
          }}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAdmin={() => navigateTo('admin')}
        />
      )}
    </div>
  );
}
