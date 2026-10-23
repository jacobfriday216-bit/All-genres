import React, { useEffect, useRef } from 'react';
import { AdPlacementConfig } from '../types';

interface AdPlacementProps {
  placement: AdPlacementConfig | undefined;
  className?: string;
  slotName?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  placement,
  className = '',
  slotName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // If placement is disabled or has no code, return null (zero blank boxes!)
  if (!placement || !placement.enabled || !placement.code || !placement.code.trim()) {
    return null;
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    // Handle injected HTML or scripts properly
    const temp = document.createElement('div');
    temp.innerHTML = placement.code.trim();

    // Scripts inserted via innerHTML are not executed by default; evaluate script tags
    const scripts = temp.querySelectorAll('script');
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName !== 'SCRIPT') {
        container.appendChild(node.cloneNode(true));
      }
    });

    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      container.appendChild(newScript);
    });
  }, [placement.code]);

  return (
    <aside
      aria-label="Advertisement"
      className={`my-4 flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Advertisement
        </span>
        {slotName && (
          <span className="text-[9px] uppercase tracking-wider text-zinc-400">
            · {slotName}
          </span>
        )}
      </div>
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center min-h-[50px] max-w-full overflow-x-auto rounded bg-zinc-50/50 dark:bg-zinc-900/40 p-1"
      />
    </aside>
  );
};
