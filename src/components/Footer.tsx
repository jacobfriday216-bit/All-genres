import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Twitter, Facebook, Instagram, Youtube, Heart } from 'lucide-react';
import { SiteSettings } from '../types';
import { PolicyType } from './PolicyModal';

interface FooterProps {
  settings: SiteSettings;
  onSelectCategory: (cat: string) => void;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenPolicy,
  onOpenAdmin
}) => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Editorial Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" light showTagline={true} />
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              ALL GENRES is your premier digital authority on entertainment news, music releases,
              Nollywood, Hollywood blockbusters, celebrity biographies, and global popular culture.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200 mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectCategory('music')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Music & Singles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('musicians')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Musicians & Spotlights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('movies')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Movies & Trailers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('actors')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Actors & Actresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('nollywood')}
                  className="text-amber-400 hover:underline transition-colors cursor-pointer font-bold"
                >
                  Nollywood Cinema
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('hollywood')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Hollywood & Box Office
                </button>
              </li>
            </ul>
          </div>

          {/* Trending & Culture */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200 mb-4">
              Trends & People
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectCategory('trending')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Trending Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('celebrity-news')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Celebrity News & Bios
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-200 transition-colors"
                >
                  XML Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-200 transition-colors"
                >
                  robots.txt Index
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Editorial Information */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200 mb-4">
              Editorial & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPolicy('about')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  About ALL GENRES
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('contact')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Contact Desk & Press
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('disclaimer')}
                  className="hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Editorial & Ad Disclaimer
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 hover:border-zinc-700 transition-colors cursor-pointer font-bold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Verification Line */}
        <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ALL GENRES Media Network. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Crafted for music & movie lovers worldwide with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
