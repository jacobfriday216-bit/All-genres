import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  ShieldCheck,
  User as UserIcon,
  Radio,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';
import { User } from '../types';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onSearch: (query: string) => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  onLogout: () => void;
  visitorRegistrationEnabled: boolean;
  breakingArticle?: { title: string; slug: string };
  onSelectArticle: (slug: string) => void;
  onOpenSearchModal: () => void;
}

export const CATEGORIES: { label: string; value: string; isHot?: boolean; icon?: string }[] = [
  { label: 'All Stories', value: 'all' },
  { label: 'Music', value: 'music', icon: '🎵' },
  { label: 'Musicians', value: 'musicians', icon: '🎤' },
  { label: 'Movies', value: 'movies', icon: '🎬' },
  { label: 'Actors', value: 'actors', icon: '⭐' },
  { label: 'Nollywood', value: 'nollywood', isHot: true, icon: '🌟' },
  { label: 'Hollywood', value: 'hollywood', icon: '🎥' },
  { label: 'Celebrity News', value: 'celebrity-news', icon: '👑' },
  { label: 'Trending', value: 'trending', isHot: true, icon: '🔥' }
];

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onGoHome,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
  onLogout,
  visitorRegistrationEnabled,
  breakingArticle,
  onSelectArticle,
  onOpenSearchModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80 text-white shadow-xl transition-all">
      {/* Top Breaking Ticker */}
      <div className="bg-gradient-to-r from-red-950/90 via-zinc-950 to-zinc-950 border-b border-zinc-800/60 py-1.5 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 shadow-sm animate-pulse">
              <Radio className="w-3 h-3" />
              BREAKING
            </span>
            {breakingArticle ? (
              <button
                onClick={() => onSelectArticle(breakingArticle.slug)}
                className="text-zinc-200 hover:text-amber-300 font-medium truncate text-left transition-colors cursor-pointer text-xs"
              >
                {breakingArticle.title}
              </button>
            ) : (
              <span className="text-zinc-300 truncate text-xs">
                ALL GENRES — Premier global entertainment, music, cinema & pop culture publication.
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 text-zinc-400 text-[11px] flex-shrink-0">
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="text-zinc-700">|</span>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Admin Desk
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={onGoHome}
          className="cursor-pointer transition-transform duration-200 active:scale-98 flex-shrink-0"
        >
          <Logo size="md" light showTagline={false} />
        </div>

        {/* Desktop Primary Navigation */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-white bg-zinc-800 shadow-inner border-b-2 border-red-500 font-black'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
                {cat.isHot && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 ml-1 mb-0.5 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Search & Action Center */}
        <div className="flex items-center gap-2">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearchModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
            title="Search ALL GENRES"
          >
            <Search className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline-block text-zinc-400">Search articles...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-zinc-950 border border-zinc-700 text-[9px] text-zinc-400 rounded">
              /
            </kbd>
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white text-[11px] shadow">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="hidden sm:inline-block max-w-[80px] truncate text-zinc-200">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3.5 py-2 border-b border-zinc-800 mb-1">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-zinc-400 text-[10px] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 uppercase text-[9px] font-black tracking-wider text-amber-400">
                      {currentUser.role === 'admin' ? 'Master Admin' : 'Registered Reader'}
                    </span>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3.5 py-2 text-zinc-200 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Admin Control Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            visitorRegistrationEnabled && (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )
          )}

          {/* Mobile Menu Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            className="xl:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Touch-Friendly Horizontal Category Scroll Bar (Visible on mobile & tablets for instant navigation) */}
      <div className="xl:hidden border-t border-zinc-800/80 bg-zinc-950/90 overflow-x-auto no-scrollbar smooth-scroll-x px-3 py-1.5 flex items-center gap-1.5">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
              {cat.isHot && <span className="ml-1 text-amber-300">★</span>}
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-5 space-y-4 animate-in slide-in-from-top-2 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Navigation Categories
            </span>
            <span className="text-[10px] text-amber-400 font-bold">ALL GENRES Magazine</span>
          </div>

          {/* Mobile Categories Grid */}
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`py-2.5 px-3 rounded-xl text-left text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  {cat.isHot && <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Admin Portal Access</span>
            </button>

            {!currentUser && visitorRegistrationEnabled && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <UserIcon className="w-4 h-4" />
                <span>Join ALL GENRES Club / Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
