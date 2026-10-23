import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  light = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon: Modern Entertainment Fusion of Film Reel, Soundwave, and Media Diamond */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Outer Ring with film perforation marks */}
          <circle cx="32" cy="32" r="30" fill="#0A0A0E" stroke="#1F1F2E" strokeWidth="2" />
          
          <circle
            cx="32"
            cy="32"
            r="23"
            stroke="url(#logo_grad_red_gold)"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />

          {/* Sound wave bars */}
          <rect x="14" y="27" width="2.5" height="10" rx="1.25" fill="#EF4444" />
          <rect x="18" y="23" width="2.5" height="18" rx="1.25" fill="#F59E0B" />
          <rect x="43.5" y="23" width="2.5" height="18" rx="1.25" fill="#F59E0B" />
          <rect x="47.5" y="27" width="2.5" height="10" rx="1.25" fill="#EF4444" />

          {/* Inner Cinema Disc */}
          <circle cx="32" cy="32" r="14" fill="#121217" stroke="#3F3F46" strokeWidth="1.5" />

          {/* Central Star Diamond */}
          <path
            d="M32 23L34.8 29.2L41 32L34.8 34.8L32 41L29.2 34.8L23 32L29.2 29.2L32 23Z"
            fill="url(#logo_grad_amber)"
          />

          {/* Center pinpoint */}
          <circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />

          <defs>
            <linearGradient id="logo_grad_red_gold" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF4444" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="logo_grad_amber" x1="23" y1="23" x2="41" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: Bold, Editorial Media Masthead */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight font-black uppercase font-sans">
          <span className={`${textSizes[size]} ${light ? 'text-white' : 'text-zinc-950 dark:text-white'} font-black tracking-tight`}>
            ALL
          </span>
          <span className={`${textSizes[size]} ml-1.5 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-500 to-rose-500 font-extrabold tracking-tight`}>
            GENRES
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 ml-1 -mb-2 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500 mt-1">
            Global Entertainment & Pop Culture
          </span>
        )}
      </div>
    </div>
  );
};
