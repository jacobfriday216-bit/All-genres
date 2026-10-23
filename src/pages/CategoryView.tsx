import React, { useState } from 'react';
import { Article, MonetagConfig } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { AdPlacement } from '../components/AdPlacement';
import { Flame, Sparkles, Filter, ChevronRight, ArrowLeft } from 'lucide-react';

interface CategoryViewProps {
  categorySlug: string;
  categoryName: string;
  articles: Article[];
  monetag: MonetagConfig | undefined;
  onSelectArticle: (slug: string) => void;
  onGoHome: () => void;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  music: 'From chart-topping Afrobeats and hip-hop to pop anthems and world tours, explore daily music news, track reviews, and album drops.',
  musicians: 'In-depth profiles, exclusive interviews, and creative journeys of the world’s most influential recording artists and producers.',
  movies: 'Box office analysis, blockbuster previews, theatrical reviews, and cinematic breakthroughs reshaping global storytelling.',
  actors: 'Intimate celebrity biographies, red-carpet spotlights, and awards-season triumphs of legendary actors and rising superstars.',
  nollywood: 'The pulse of the Nigerian film industry: record-shattering theatrical runs, streaming acquisitions, and celebrated filmmakers.',
  hollywood: 'Behind the scenes of major Hollywood studios, auteur spectacles, Academy Awards predictions, and industry box office figures.',
  'celebrity-news': 'Exclusive celebrity lifestyles, romances, red carpet fashion, net worth deep-dives, and behind-the-velvet-rope scoops.',
  trending: 'Viral entertainment buzz, breaking cultural moments, and high-velocity stories taking over social media and sound systems today.'
};

export const CategoryView: React.FC<CategoryViewProps> = ({
  categorySlug,
  categoryName,
  articles,
  monetag,
  onSelectArticle,
  onGoHome
}) => {
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const filteredArticles = [...articles].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const description =
    CATEGORY_DESCRIPTIONS[categorySlug] ||
    `Latest news, reports, and exclusive entertainment coverage for ${categoryName}.`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Top Leaderboard Ad */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <AdPlacement placement={monetag?.placements?.header} slotName="Header Leaderboard" />
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6">
          <button
            onClick={onGoHome}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-red-400 uppercase font-black tracking-wider">{categoryName}</span>
        </nav>

        {/* Category Masthead */}
        <div className="mb-10 pb-6 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-xs uppercase font-black tracking-widest text-zinc-400">
                  ALL GENRES Editorial Department
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                {categoryName}
              </h1>
              <p className="mt-2 text-xs sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-red-500" />
                Sort:
              </span>
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  sortBy === 'latest'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  sortBy === 'popular'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Most Popular
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout with Main Grid and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800">
                <p className="text-zinc-400 text-sm">
                  No published stories in this category yet. Check back shortly for new updates!
                </p>
              </div>
            ) : (
              <>
                {/* Hero Feature for first article */}
                {filteredArticles[0] && (
                  <ArticleCard
                    article={filteredArticles[0]}
                    variant="featured"
                    onClick={() => onSelectArticle(filteredArticles[0].slug)}
                  />
                )}

                {/* In-feed ad unit after hero */}
                <AdPlacement
                  placement={monetag?.placements?.homepage}
                  slotName="In-Feed Sponsor"
                />

                {/* Rest of the articles grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {filteredArticles.slice(1).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="standard"
                      onClick={() => onSelectArticle(article.slug)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad Placement */}
            <AdPlacement placement={monetag?.placements?.sidebar} slotName="Sidebar Ad Unit" />

            {/* Trending in ALL GENRES Widget */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                Trending Stories
              </h3>
              <div className="divide-y divide-zinc-800/80">
                {articles.slice(0, 5).map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art.slug)}
                    className="py-3 flex items-start gap-3 cursor-pointer group"
                  >
                    <span className="text-xl font-black text-zinc-600 group-hover:text-red-500 transition-colors font-display w-6 text-right">
                      0{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {art.category}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-2 mt-0.5">
                        {art.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
