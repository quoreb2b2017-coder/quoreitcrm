'use client';

import { motion } from 'framer-motion';

export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-0"
    >
      {children}
    </motion.div>
  );
}
