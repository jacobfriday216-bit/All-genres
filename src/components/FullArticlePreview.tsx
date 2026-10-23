import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  Tag,
  Check,
  Send,
  Sparkles,
  Flame,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Article } from '../types';

interface FullArticlePreviewProps {
  article: Partial<Article>;
  onBack: () => void;
  onPublish?: () => Promise<void>;
  isPublishing?: boolean;
  relatedArticles?: Article[];
}

export const FullArticlePreview: React.FC<FullArticlePreviewProps> = ({
  article,
  onBack,
  onPublish,
  isPublishing = false,
  relatedArticles = []
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

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

  const wordCount = article.content?.trim()
    ? article.content.trim().split(/\s+/).length
    : 0;
  const readingTime = article.readingTime || Math.max(1, Math.ceil(wordCount / 200));

  const displayDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

  const paragraphs = (article.content || '').split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* 1. TOP STICKY PREVIEW CONTROL BAR */}
      <header className="sticky top-0 z-50 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-3.5 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Return to Editor / Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
              Live Visitor Preview
            </span>
            <span className="text-xs text-zinc-400 truncate hidden sm:inline">
              Category: <strong className="text-red-400">{article.category || 'Music'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Continue Editing
          </button>

          {onPublish && (
            <button
              type="button"
              disabled={isPublishing}
              onClick={onPublish}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Publish Story'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Reading Progress Bar */}
      <div className="fixed top-[53px] left-0 right-0 h-1 bg-zinc-900 z-40">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. PUBLIC ARTICLE BODY */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-5 flex-wrap">
          <span className="text-zinc-500">Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-red-400 font-bold uppercase">{article.category || 'Entertainment'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-400 truncate max-w-xs">{article.title || 'Story Headline'}</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
            {article.category || 'Music'}
          </span>
          {article.breaking && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              Breaking News
            </span>
          )}
          {article.featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Featured Story
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-400 ml-auto">
            Status: <span className="text-zinc-200 capitalize">{article.status || 'Draft'}</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
          {article.title || 'Untitled Entertainment Story'}
        </h1>

        {/* Subtitle / Deck */}
        {article.subtitle && (
          <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal mb-6">
            {article.subtitle}
          </p>
        )}

        {/* Byline / Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-800/80 mb-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              {(article.author?.name || 'ALL GENRES').charAt(0)}
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">
                By {article.author?.name || 'Jacob Friday (Founder & Admin)'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {article.author?.role || 'Senior Entertainment Editor'} · {displayDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>{article.views || 0} reads</span>
            </div>
          </div>
        </div>

        {/* Featured Cover Image */}
        {article.featuredImage && (
          <figure className="mb-8">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/90 shadow-2xl">
              <img
                src={article.featuredImage}
                alt={article.title || ''}
                className="w-full h-full object-cover"
              />
            </div>
            {article.caption && (
              <figcaption className="text-xs text-zinc-400 italic text-center mt-2.5 px-4">
                {article.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Body Content */}
        <article className="prose prose-invert max-w-none space-y-5 text-zinc-200 text-base sm:text-lg leading-relaxed font-sans font-normal">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, index) => {
              // Highlight first paragraph with editorial drop cap
              if (index === 0) {
                return (
                  <p key={index} className="text-lg sm:text-xl text-zinc-100 font-medium leading-relaxed first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-black first-letter:text-red-500 first-letter:mr-2.5 first-letter:leading-none">
                    {p}
                  </p>
                );
              }
              return (
                <p key={index} className="leading-relaxed text-zinc-200">
                  {p}
                </p>
              );
            })
          ) : (
            <p className="text-zinc-500 italic py-8 text-center">
              No article body content written yet.
            </p>
          )}
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Tags:
            </span>
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* SEO Meta Box Preview */}
        <div className="mt-8 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Search Engine Optimization (SEO) Metadata
          </span>
          <p className="text-xs text-blue-400 font-semibold truncate">
            {article.seoTitle || `${article.title} - ALL GENRES`}
          </p>
          <p className="text-[11px] text-emerald-400 truncate font-mono">
            https://allgenres.media/article/{article.slug || 'story-headline'}
          </p>
          <p className="text-xs text-zinc-400 line-clamp-2">
            {article.seoDescription || article.subtitle || article.excerpt || 'Entertainment news and updates.'}
          </p>
        </div>

        {/* Related Stories Simulation */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              More in {article.category || 'Entertainment'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedArticles.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <img
                    src={rel.featuredImage}
                    alt={rel.title}
                    className="w-full aspect-video object-cover rounded-xl mb-2.5 bg-zinc-800"
                  />
                  <span className="text-[10px] uppercase font-bold text-red-400">
                    {rel.category}
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-2 mt-1">
                    {rel.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {rel.readingTime} min read
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Editor</span>
          </button>

          {onPublish && (
            <button
              type="button"
              disabled={isPublishing}
              onClick={onPublish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing Story...' : 'Publish This Story'}</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
