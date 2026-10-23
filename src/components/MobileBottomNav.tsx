import React from 'react';
import { Home, Flame, Music, Film, Search, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAdmin
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 shadow-2xl px-2 py-1.5 pb-safe">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors active:scale-95 cursor-pointer ${
            currentCategory === 'all' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Trending */}
        <button
          onClick={() => onSelectCategory('trending')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors active:scale-95 cursor-pointer ${
            currentCategory === 'trending' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Trending</span>
        </button>

        {/* Music */}
        <button
          onClick={() => onSelectCategory('music')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors active:scale-95 cursor-pointer ${
            currentCategory === 'music' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Music className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Music</span>
        </button>

        {/* Movies */}
        <button
          onClick={() => onSelectCategory('movies')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-colors active:scale-95 cursor-pointer ${
            currentCategory === 'movies' || currentCategory === 'nollywood'
              ? 'text-red-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Cinema</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 px-1 text-amber-400 hover:text-amber-300 transition-colors active:scale-95 cursor-pointer"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>
      </div>
    </div>
  );
};
