import React, { useState, useEffect } from 'react';
import {
  Clock,
  Eye,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
  Flame,
  Check,
  MessageCircle,
  Tag,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Article, MonetagConfig } from '../types';
import { AdPlacement } from '../components/AdPlacement';
import { CommentSection } from '../components/CommentSection';
import { ArticleCard } from '../components/ArticleCard';

interface ArticleDetailViewProps {
  article: Article;
  relatedArticles: Article[];
  monetag: MonetagConfig | undefined;
  onSelectCategory: (cat: string) => void;
  onSelectArticle: (slug: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  relatedArticles,
  monetag,
  onSelectCategory,
  onSelectArticle
}) => {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 relative">
      {/* Reading Progress Bar (Fixed Top) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-rose-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header Ad Placement (if configured) */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <AdPlacement placement={monetag?.placements?.header} slotName="Header Leaderboard" />
      </div>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-5">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 flex-wrap"
        >
          <button
            onClick={() => onSelectCategory('all')}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <button
            onClick={() => onSelectCategory(article.category.toLowerCase().replace(/ /g, '-'))}
            className="text-red-400 hover:underline uppercase font-bold tracking-wider cursor-pointer"
          >
            {article.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Article Masthead Header */}
        <header className="mb-6 space-y-4">
          <div className="flex items-center gap-2">
            {article.breaking && (
              <span className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-white" />
                Breaking News
              </span>
            )}
            <span className="text-xs uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] font-display">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author & Publication Metadata */}
          <div className="pt-3 pb-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={article.author.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40"
              />
              <div>
                <p className="text-sm font-bold text-white">By {article.author.name}</p>
                <p className="text-xs text-zinc-400">
                  {article.author.role || 'Staff Entertainment Writer'} · {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-zinc-500" />
                {article.readingTime} min read
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-zinc-500" />
                {article.views.toLocaleString()} reads
              </span>
            </div>
          </div>

          {/* Social Share Ribbon (Touch-friendly for Android/mobile) */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400">
              <Share2 className="w-4 h-4 text-amber-500" />
              Share
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on WhatsApp"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-emerald-400 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1.5 font-medium"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on X"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">X / Post</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Facebook"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-blue-400 hover:bg-zinc-800 text-zinc-300 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <button
                onClick={handleCopyLink}
                aria-label="Copy link"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image & Caption */}
        <figure className="mb-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.caption && (
            <figcaption className="mt-2.5 text-xs text-zinc-400 italic text-center">
              {article.caption}
            </figcaption>
          )}
        </figure>

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed font-sans space-y-6 text-base sm:text-lg">
          {article.content.split('\n\n').map((paragraph, index) => {
            // Check if we should insert an In-Article Ad after paragraph 2
            const showInArticleAd = index === 1 && monetag?.placements?.insideArticle?.enabled;

            return (
              <React.Fragment key={index}>
                <p className="leading-relaxed text-zinc-300 font-light text-base sm:text-lg">
                  {paragraph}
                </p>
                {showInArticleAd && (
                  <AdPlacement
                    placement={monetag?.placements?.insideArticle}
                    slotName="Sponsored Content"
                    className="my-8"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-red-500" />
              Tags:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* After-Article Ad Placement */}
        <AdPlacement
          placement={monetag?.placements?.afterArticle}
          slotName="Recommended For You"
          className="my-8"
        />

        {/* Author Bio Box */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 flex items-start gap-4 shadow-xl">
          <img
            src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={article.author.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 flex-shrink-0"
          />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              About the Journalist
            </span>
            <h4 className="text-base font-bold text-white mt-0.5">{article.author.name}</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Leading journalist specializing in global entertainment, music industry trends,
              Nollywood box office developments, and celebrity profiles for ALL GENRES.
            </p>
          </div>
        </div>

        {/* Reader Reactions and Discussion Thread */}
        <CommentSection articleId={article.id} />

        {/* Related Stories */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 pt-8 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                More in <span className="text-red-500">{article.category}</span>
              </h3>
              <button
                onClick={() => onSelectCategory(article.category.toLowerCase().replace(/ /g, '-'))}
                className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer"
              >
                View Category Archive →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <ArticleCard
                  key={rel.id}
                  article={rel}
                  variant="standard"
                  onClick={() => {
                    onSelectArticle(rel.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Ad Placement */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <AdPlacement placement={monetag?.placements?.footer} slotName="Footer Billboard" />
      </div>
    </div>
  );
};
