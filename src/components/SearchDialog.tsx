import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Flame, Clock, ChevronRight, Tag } from 'lucide-react';
import { Article } from '../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (slug: string) => void;
  onFullSearch: (query: string) => void;
}

const POPULAR_SEARCHES = [
  'Burna Boy Tour',
  'Nollywood Box Office',
  'Zendaya Emmy',
  'Asake Fuji Amapiano',
  'Pedro Pascal',
  'Oscars Contenders',
  'Afrobeats London'
];

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
  onFullSearch
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const liveResults = trimmed
    ? articles
        .filter(
          (a) =>
            a.title.toLowerCase().includes(trimmed) ||
            a.content.toLowerCase().includes(trimmed) ||
            a.category.toLowerCase().includes(trimmed) ||
            a.tags.some((t) => t.toLowerCase().includes(trimmed))
        )
        .slice(0, 5)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && query.trim()) {
      onFullSearch(query.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <Search className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entertainment news, music, movies, celebrities..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* If query has results */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <span>Matching Stories ({liveResults.length})</span>
                {liveResults.length > 0 && (
                  <button
                    onClick={() => {
                      onFullSearch(query);
                      onClose();
                    }}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    View All Results →
                  </button>
                )}
              </div>

              {liveResults.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No direct headlines found for "{query}". Press Enter to run full database search.
                </div>
              ) : (
                <div className="space-y-2">
                  {liveResults.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        onSelectArticle(art.slug);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                    >
                      <img
                        src={art.featuredImage}
                        alt=""
                        className="w-14 h-11 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          {art.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-amber-400 truncate">
                          {art.title}
                        </h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Popular Search Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    onFullSearch(term);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-red-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
          <span>Search ALL GENRES Entertainment News</span>
          <span>Press Enter to execute</span>
        </div>
      </div>
    </div>
  );
};
