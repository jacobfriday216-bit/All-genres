import React, { useState } from 'react';
import { Clock, Eye, Flame, Share2, Check, Bookmark } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'featured' | 'standard' | 'compact' | 'horizontal' | 'spotlight';
  onClick: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  onClick
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/article/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  // 1. HERO FEATURED VARIANT
  if (variant === 'featured') {
    return (
      <article
        onClick={onClick}
        className="group relative cursor-pointer overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/90 text-white shadow-2xl transition-all duration-300 hover:border-zinc-700/80 hover:shadow-red-950/20"
      >
        <div className="relative aspect-[16/9] md:aspect-[21/10] w-full overflow-hidden bg-zinc-900">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="eager"
          />
          {/* Deep Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent hidden md:block" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            {article.breaking && (
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-white" />
                Breaking Headline
              </span>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30">
              Featured Exclusive
            </span>
          </div>

          {/* Quick interactive actions on image */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleBookmarkClick}
              aria-label="Bookmark article"
              className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={handleShareClick}
              aria-label="Share article"
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom Headline Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10">
            {/* Metadata (Zero-pill typography) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2.5">
              <span className="text-red-400 uppercase tracking-widest font-black">
                {article.category}
              </span>
              <span>·</span>
              <span>{formattedDate}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {article.readingTime} min read
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.15] group-hover:text-amber-300 transition-colors">
              {article.title}
            </h2>

            {article.subtitle && (
              <p className="mt-3 text-sm sm:text-base text-zinc-300 line-clamp-2 max-w-3xl leading-relaxed hidden sm:block font-normal">
                {article.subtitle}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/50"
                />
                <span className="text-xs font-medium text-zinc-300">
                  By <strong className="text-white">{article.author.name}</strong>
                </span>
              </div>
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString()} reads
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. SPOTLIGHT / SECONDARY LEAD CARD
  if (variant === 'spotlight') {
    return (
      <article
        onClick={onClick}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-lg transition-all duration-300 hover:border-zinc-700"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
              {article.category}
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 mb-2">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{article.readingTime} min read</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {article.excerpt || article.subtitle}
          </p>
        </div>
      </article>
    );
  }

  // 3. COMPACT SIDEBAR / LIST VARIANT
  if (variant === 'compact') {
    return (
      <article
        onClick={onClick}
        className="group flex gap-3.5 cursor-pointer py-3 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/40 px-2 rounded-xl transition-all"
      >
        <div className="relative w-22 h-20 sm:w-24 sm:h-22 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-between flex-grow min-w-0">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 mb-1">
              <span className="text-red-400 uppercase tracking-wider font-black">
                {article.category}
              </span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold leading-snug text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2">
              {article.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime}m
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 4. HORIZONTAL MAGAZINE ROW
  if (variant === 'horizontal') {
    return (
      <article
        onClick={onClick}
        className="group grid grid-cols-1 md:grid-cols-12 gap-5 cursor-pointer p-4 sm:p-5 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 shadow-md hover:shadow-xl transition-all hover:border-zinc-700 hover:bg-zinc-900"
      >
        <div className="relative md:col-span-5 aspect-[16/10] overflow-hidden rounded-xl bg-zinc-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {article.breaking && (
            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
              Breaking
            </span>
          )}
        </div>
        <div className="md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
              <span className="text-red-400 font-black uppercase tracking-widest">
                {article.category}
              </span>
              <span>·</span>
              <span>{formattedDate}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime} min
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
              {article.title}
            </h3>
            {article.subtitle && (
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                {article.subtitle}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <img
                src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                alt={article.author.name}
                className="w-6 h-6 rounded-full object-cover border border-zinc-700"
              />
              <span className="text-xs text-zinc-300 font-medium">
                {article.author.name}
              </span>
            </div>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 5. STANDARD MAGAZINE GRID CARD
  return (
    <article
      onClick={onClick}
      className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/70 shadow-md hover:shadow-xl transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {article.breaking && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
            Breaking
          </span>
        )}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded">
            {article.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
          <span>{formattedDate}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            {article.readingTime} min
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed flex-grow">
          {article.excerpt || article.subtitle}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300 truncate max-w-[140px]">
            {article.author.name}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Eye className="w-3 h-3" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
};
