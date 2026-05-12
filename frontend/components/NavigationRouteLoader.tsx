'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageSpinner } from '@/components/ui/PageSpinner';

function currentLocationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function targetLocationKey(href: string) {
  const u = new URL(href, window.location.href);
  return `${u.pathname}${u.search}`;
}

/**
 * Shows a circular loader from internal link click (or browser back/forward)
 * until the URL (pathname or query) updates.
 */
export function NavigationRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [navigating, setNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, search]);

  useEffect(() => {
    const clearSafety = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const armSafety = () => {
      clearSafety();
      timeoutRef.current = setTimeout(() => {
        setNavigating(false);
        timeoutRef.current = null;
      }, 15000);
    };

    const start = () => {
      setNavigating(true);
      armSafety();
    };

    const onClickCapture = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('a[href]');
      if (!el || !(el instanceof HTMLAnchorElement)) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (el.target === '_blank' || el.getAttribute('rel') === 'external') return;
      if (el.hasAttribute('download')) return;

      const href = el.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (nextUrl.origin !== window.location.origin) return;

      const next = targetLocationKey(href);
      const current = currentLocationKey();
      if (next === current) return;

      start();
    };

    const onPopState = () => {
      start();
    };

    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('popstate', onPopState);
      clearSafety();
    };
  }, []);

  if (!navigating) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] flex items-start justify-center bg-black/[0.04] pt-[max(4.5rem,12vh)] backdrop-blur-[1px]"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="rounded-2xl bg-background/95 p-5 shadow-lg ring-1 ring-border">
        <PageSpinner size="lg" variant="light" />
      </div>
    </div>
  );
}
