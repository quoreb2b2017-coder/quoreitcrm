'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Scrollable dashboard main column; resets scroll on route change (window scroll alone is not enough).
 */
export function MainScrollArea({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar [-webkit-overflow-scrolling:touch]"
    >
      {children}
    </main>
  );
}
