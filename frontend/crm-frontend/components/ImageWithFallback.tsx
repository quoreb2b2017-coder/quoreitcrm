'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  fallbackLabel?: string;
};

export function ImageWithFallback({
  src,
  alt,
  fill = true,
  className = '',
  sizes,
  quality = 90,
  priority,
  fallbackLabel,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 ${className}`}
        aria-label={alt}
      >
        <div className="text-center p-6">
          <svg
            className="mx-auto h-14 w-14 text-[var(--primary)]/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          {fallbackLabel && (
            <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">{fallbackLabel}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      quality={quality}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
