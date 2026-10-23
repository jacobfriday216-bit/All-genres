import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Zap } from 'lucide-react';
import { MonetagConfig } from '../types';

interface SmartLinkModalProps {
  config: MonetagConfig['smartLink'] | undefined;
  isHomepage: boolean;
  isPreview?: boolean;
}

export const SmartLinkModal: React.FC<SmartLinkModalProps> = ({
  config,
  isHomepage,
  isPreview = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If preview mode, force open
    if (isPreview) {
      setIsOpen(true);
      return;
    }

    // Safety checks: must be enabled and have valid URL
    if (!config || !config.enabled || !config.url || !config.url.trim()) {
      setIsOpen(false);
      return;
    }

    // Check homepage restriction
    if (config.showOnHomepageOnly && !isHomepage) {
      setIsOpen(false);
      return;
    }

    // Frequency cap check
    const STORAGE_KEY = 'allgenres_smartlink_last_seen';
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const frequencyMs = (config.frequencyHours || 24) * 60 * 60 * 1000;

    if (lastSeen && Date.now() - parseInt(lastSeen, 10) < frequencyMs) {
      return;
    }

    // Delay timer
    const delayMs = (config.delaySeconds || 5) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }, delayMs);

    return () => clearTimeout(timer);
  }, [config, isHomepage, isPreview]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (config?.allowDismiss !== false || isPreview) {
      setIsOpen(false);
    }
  };

  const handleAction = () => {
    if (config?.url && !isPreview) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-rose-500" />

        {/* Dismiss Button */}
        {(config?.allowDismiss !== false || isPreview) && (
          <button
            onClick={handleDismiss}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 pt-7 text-center">
          {/* Badge Icon */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-2">
            {config?.title || 'Exclusive Entertainment Spotlight'}
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            {config?.description ||
              'Discover VIP entertainment news, music premiers, and exclusive partner promotions.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-red-500/25 transition-all transform active:scale-98 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{config?.buttonText || 'Discover Now'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {(config?.allowDismiss !== false || isPreview) && (
              <button
                onClick={handleDismiss}
                className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-2.5 bg-zinc-950/60 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500">
          ALL GENRES Official Partner Network
        </div>
      </div>
    </div>
  );
};
