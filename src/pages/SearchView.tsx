import React, { useState } from 'react';
import { Article, MonetagConfig } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Search, ChevronRight, Filter, ArrowLeft, X } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';

interface SearchViewProps {
  initialQuery: string;
  articles: Article[];
  monetag: MonetagConfig | undefined;
  onSelectArticle: (slug: string) => void;
  onGoHome: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery,
  articles,
  monetag,
  onSelectArticle,
  onGoHome
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filtered = articles.filter((a) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));

    const matchesCat =
      selectedCat === 'all' ||
      a.category.toLowerCase().replace(/ /g, '-') === selectedCat;

    return matchesQuery && matchesCat;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
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
          <span className="text-red-400 uppercase font-black tracking-wider">Search Portal</span>
        </nav>

        {/* Search Bar Header */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl">
          <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 font-display">
            Search Entertainment News
          </h1>
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-red-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actors, musicians, Nollywood, Hollywood, album reviews..."
              className="w-full pl-11 pr-10 py-3 text-sm sm:text-base bg-zinc-950 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar smooth-scroll-x pb-1 text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter:
            </span>
            {['all', 'music', 'musicians', 'movies', 'actors', 'nollywood', 'hollywood', 'celebrity-news', 'trending'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-full uppercase font-bold text-[11px] tracking-wider transition-colors cursor-pointer flex-shrink-0 ${
                  selectedCat === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-400">
            Showing <strong className="text-white font-bold">{filtered.length}</strong> entertainment articles
            {query && <span> for &ldquo;{query}&rdquo;</span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No articles matched your search</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Try searching for keywords such as &ldquo;Afrobeats&rdquo;, &ldquo;Nollywood&rdquo;, &ldquo;Burna Boy&rdquo;, &ldquo;Zendaya&rdquo;, or &ldquo;Oscars&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="standard"
                onClick={() => onSelectArticle(art.slug)}
              />
            ))}
          </div>
        )}

        <div className="mt-12">
          <AdPlacement placement={monetag?.placements?.footer} slotName="Search Footer Ad" />
        </div>
      </div>
    </div>
  );
};
