'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fromRight?: boolean;
  className?: string;
  /** Optional footer */
  footer?: React.ReactNode;
  /** Width */
  width?: string;
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  fromRight = true,
  className = '',
  footer,
  width = 'max-w-md',
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex ${fromRight ? 'justify-end' : 'justify-start'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: fromRight ? '100%' : '-100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: fromRight ? '100%' : '-100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className={`relative flex h-full w-full flex-col ${fromRight ? 'border-l' : 'border-r'} border-[var(--border)] bg-[var(--surface)] shadow-2xl ${width} ${className}`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <h2 id="drawer-title" className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="btn-icon h-8 w-8 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <motion.div
              className="flex-1 overflow-y-auto custom-scrollbar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="px-5 py-5">
                {children}
              </div>
            </motion.div>

            {/* Footer (optional) */}
            {footer && (
              <div className="shrink-0 border-t border-[var(--border)] bg-slate-50/60 px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
