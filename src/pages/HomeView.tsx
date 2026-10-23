import React, { useState } from 'react';
import { Article, MonetagConfig } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { AdPlacement } from '../components/AdPlacement';
import { CelebritySpotlight } from '../components/CelebritySpotlight';
import {
  Flame,
  Sparkles,
  Music,
  Film,
  Star,
  ChevronRight,
  Award,
  TrendingUp,
  Zap,
  Globe2
} from 'lucide-react';

interface HomeViewProps {
  articles: Article[];
  monetag: MonetagConfig | undefined;
  onSelectArticle: (slug: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  monetag,
  onSelectArticle,
  onSelectCategory
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filtered stories if user uses in-page quick filter
  const displayArticles = activeFilter === 'all'
    ? articles
    : articles.filter((a) => a.category.toLowerCase().replace(/ /g, '-') === activeFilter);

  // Curated subsets
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const secondaryStories = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 2);
  const trendingArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const musicArticles = articles.filter((a) => a.category === 'Music' || a.category === 'Musicians');
  const nollywoodArticles = articles.filter((a) => a.category === 'Nollywood');
  const hollywoodArticles = articles.filter((a) => a.category === 'Hollywood' || a.category === 'Actors');
  const celebrityNewsArticles = articles.filter((a) => a.category === 'Celebrity News');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header Billboard Ad Placement */}
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <AdPlacement placement={monetag?.placements?.header} slotName="Header Leaderboard" />
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        {/* 1. MULTI-TIER HERO SECTION */}
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Lead Story (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {featuredArticle && (
                <ArticleCard
                  article={featuredArticle}
                  variant="featured"
                  onClick={() => onSelectArticle(featuredArticle.slug)}
                />
              )}

              {/* Secondary Lead Cards (2 columns under hero on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {secondaryStories.map((story) => (
                  <ArticleCard
                    key={story.id}
                    article={story}
                    variant="spotlight"
                    onClick={() => onSelectArticle(story.slug)}
                  />
                ))}
              </div>
            </div>

            {/* Trending Power List Sidebar (4 cols) */}
            <aside className="lg:col-span-4 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/90 p-5 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
                      <Flame className="w-4 h-4 fill-current animate-pulse" />
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                      Trending Top 5
                    </h3>
                  </div>
                  <button
                    onClick={() => onSelectCategory('trending')}
                    className="text-xs text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Rank</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {trendingArticles.map((art, idx) => (
                    <div
                      key={art.id}
                      onClick={() => onSelectArticle(art.slug)}
                      className="py-3 px-2.5 flex items-start gap-3.5 cursor-pointer group border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/50 rounded-xl transition-all"
                    >
                      <span className="text-2xl font-black text-zinc-600 group-hover:text-red-500 transition-colors w-7 text-right flex-shrink-0 font-display">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-0.5">
                          <span className="font-bold text-red-400 uppercase tracking-wider">
                            {art.category}
                          </span>
                          <span>·</span>
                          <span>{art.readingTime}m read</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-amber-400 line-clamp-2 leading-snug transition-colors">
                          {art.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Ad Slot */}
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <AdPlacement placement={monetag?.placements?.sidebar} slotName="Sidebar Sponsor" />
              </div>
            </aside>
          </div>
        </section>

        {/* 2. CELEBRITY SPOTLIGHT STRIP (Horizontal swipeable on Android & mobile) */}
        <CelebritySpotlight
          onSelectArticle={onSelectArticle}
          onExploreAll={() => onSelectCategory('actors')}
        />

        {/* 3. IN-PAGE QUICK FILTER CHIPS */}
        <div className="mb-8 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar smooth-scroll-x pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Filter:
            </span>
            {[
              { label: 'All Stories', value: 'all' },
              { label: '🔥 Trending', value: 'trending' },
              { label: '🎵 Music & Afrobeats', value: 'music' },
              { label: '🌟 Nollywood Cinema', value: 'nollywood' },
              { label: '🎬 Hollywood Stars', value: 'hollywood' },
              { label: '👑 Celebrity News', value: 'celebrity-news' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                  activeFilter === f.value
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Homepage In-Feed Banner Ad */}
        <AdPlacement placement={monetag?.placements?.homepage} slotName="In-Feed Billboard" />

        {/* 4. LATEST HEADLINES FEED & DESKTOP SIDEBAR */}
        <section className="mb-14">
          <div className="flex items-center justify-between pb-3.5 mb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-red-500">
                Live From The Newsroom
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {activeFilter === 'all'
                  ? 'Latest Entertainment Stories'
                  : `${activeFilter.replace(/-/g, ' ').toUpperCase()} Stories`}
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory(activeFilter)}
              className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer"
            >
              View Feed Archive →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Stories */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayArticles.slice(0, 4).map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant="standard"
                    onClick={() => onSelectArticle(art.slug)}
                  />
                ))}
              </div>

              {displayArticles.length > 4 && (
                <div className="pt-2 space-y-4">
                  {displayArticles.slice(4, 8).map((art) => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      onClick={() => onSelectArticle(art.slug)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Cols: Curated Sidebar Modules */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Nollywood Box Office Widget */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/90 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                      <Film className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Nollywood Cinema
                    </h3>
                  </div>
                  <button
                    onClick={() => onSelectCategory('nollywood')}
                    className="text-[11px] text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    All Nollywood →
                  </button>
                </div>

                <div className="space-y-2">
                  {nollywoodArticles.slice(0, 3).map((art) => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      variant="compact"
                      onClick={() => onSelectArticle(art.slug)}
                    />
                  ))}
                </div>
              </div>

              {/* VIP Entertainment Club Newsletter */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">ALL GENRES Insider</h4>
                <p className="text-xs text-zinc-300 mt-1 mb-4 leading-relaxed">
                  Receive daily entertainment scoops, music track previews, and movie festival passes directly in your inbox.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you for joining the ALL GENRES VIP Insider community!');
                  }}
                  className="space-y-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Join Free Newsletter
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </section>

        {/* 5. CURATED MUSIC & AFROBEATS SECTION */}
        <section className="mb-14 pt-8 border-t border-zinc-800/80">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
                <Music className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Global Sounds & Charts
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Afrobeats & World Music
                </h2>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('music')}
              className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer flex items-center gap-1"
            >
              <span>Explore Music</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {musicArticles.slice(0, 3).map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="standard"
                onClick={() => onSelectArticle(art.slug)}
              />
            ))}
          </div>
        </section>

        {/* 6. HOLLYWOOD & RED CARPET GALAS */}
        <section className="mb-14 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Star className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Blockbusters & Red Carpet
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Hollywood & Celebrity Biographies
                </h2>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('hollywood')}
              className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider cursor-pointer flex items-center gap-1"
            >
              <span>Explore Hollywood</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hollywoodArticles.concat(celebrityNewsArticles).slice(0, 3).map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="standard"
                onClick={() => onSelectArticle(art.slug)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
