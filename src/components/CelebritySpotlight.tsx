import React from 'react';
import { Star, ChevronRight, Sparkles } from 'lucide-react';

export interface CelebrityBio {
  name: string;
  tagline: string;
  industry: 'Afrobeats' | 'Nollywood' | 'Hollywood' | 'Global Pop';
  avatar: string;
  articleSlug: string;
  stats: string;
}

const CELEBRITIES: CelebrityBio[] = [
  {
    name: 'Zendaya',
    tagline: 'Emmy Winner & Style Icon',
    industry: 'Hollywood',
    avatar: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'inside-life-zendaya-fashion-icon-emmy-winner',
    stats: '2x Emmy Winner'
  },
  {
    name: 'Burna Boy',
    tagline: 'African Giant & MSG Titan',
    industry: 'Afrobeats',
    avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'afrobeats-global-stadium-tour-burna-boy-wizkid',
    stats: 'Grammy Winner'
  },
  {
    name: 'Genevieve Nnaji',
    tagline: 'Nollywood Directorial Pioneer',
    industry: 'Nollywood',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'genevieve-nnaji-nollywood-queen-african-cinema-biography',
    stats: 'AMAA Legend'
  },
  {
    name: 'Pedro Pascal',
    tagline: 'The Leading Man of Cinema',
    industry: 'Hollywood',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'pedro-pascal-internets-hero-super-stardom-interview',
    stats: 'SAG Nominee'
  },
  {
    name: 'Rema',
    tagline: 'Afrorave Pioneer & Hitmaker',
    industry: 'Afrobeats',
    avatar: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'rema-calm-down-billboard-records-afrorave-superstar',
    stats: '2B+ Streams'
  },
  {
    name: 'Tiwa Savage',
    tagline: 'The Queen of Afrobeats',
    industry: 'Afrobeats',
    avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'tems-tiwa-savage-women-reshaping-global-afrobeats',
    stats: 'BET Winner'
  },
  {
    name: 'Asake',
    tagline: 'Mr. Money Sonic Sensation',
    industry: 'Afrobeats',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    articleSlug: 'the-rise-of-asake-mr-money-fuji-amapiano',
    stats: 'O2 Arena Headliner'
  }
];

interface CelebritySpotlightProps {
  onSelectArticle: (slug: string) => void;
  onExploreAll: () => void;
}

export const CelebritySpotlight: React.FC<CelebritySpotlightProps> = ({
  onSelectArticle,
  onExploreAll
}) => {
  return (
    <section className="my-8 py-5 border-y border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                Celebrity Biographies & Star Spotlights
              </h3>
              <p className="text-[11px] text-zinc-400">
                Explore the icons of Afrobeats, Nollywood, and Hollywood
              </p>
            </div>
          </div>
          <button
            onClick={onExploreAll}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>All Stars</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Swipe Rail for Android & Mobile */}
        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar smooth-scroll-x snap-x snap-mandatory">
          {CELEBRITIES.map((celeb) => (
            <div
              key={celeb.name}
              onClick={() => onSelectArticle(celeb.articleSlug)}
              className="flex-shrink-0 flex flex-col items-center text-center cursor-pointer group snap-start w-24 sm:w-28 transition-transform duration-200 active:scale-95"
            >
              {/* Avatar with glowing ring on hover */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 mb-2 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-red-600 via-amber-500 to-rose-600 shadow-md group-hover:shadow-amber-500/30 transition-all duration-300 group-hover:scale-105">
                <img
                  src={celeb.avatar}
                  alt={celeb.name}
                  className="w-full h-full object-cover rounded-[14px] bg-zinc-900"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate w-full">
                {celeb.name}
              </h4>
              <span className="text-[10px] text-red-400 uppercase font-black tracking-wider truncate w-full mt-0.5">
                {celeb.industry}
              </span>
              <span className="text-[9px] text-zinc-400 truncate w-full">
                {celeb.stats}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
