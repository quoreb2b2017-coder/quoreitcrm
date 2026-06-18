'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Optional footer actions */
  footer?: React.ReactNode;
  /** Size presets */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, className = '', size = 'md', footer }: ModalProps) {
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`relative w-full flex flex-col max-h-[92vh] sm:max-h-[85vh] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] shadow-2xl ${sizeMap[size]} ${className}`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <h2 id="modal-title" className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">
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
            <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
              {children}
            </div>

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
