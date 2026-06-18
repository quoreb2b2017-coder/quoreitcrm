'use client';

type PageSpinnerProps = {
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
  /** `dark` for slate/fullscreen boot; `light` for white/card backgrounds */
  variant?: 'light' | 'dark';
  className?: string;
};

const sizeClass: Record<NonNullable<PageSpinnerProps['size']>, string> = {
  sm: 'h-8 w-8 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-14 w-14 border-[3px]',
};

const variantClass: Record<NonNullable<PageSpinnerProps['variant']>, string> = {
  light: 'border-blue-500/20 border-t-blue-500',
  dark: 'border-white/15 border-t-sky-400',
};

/** Accessible circular loader only (no visible text). */
export function PageSpinner({ size = 'md', variant = 'light', className = '' }: PageSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div
        className={`rounded-full ${sizeClass[size]} ${variantClass[variant]} animate-spin`}
        aria-hidden
      />
    </div>
  );
}
