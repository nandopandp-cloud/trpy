'use client';

import { motion } from 'framer-motion';

// Two pulsing dots connected by a dashed arc — origin → destination
export function TrpyBrandMark() {
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="bm-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4338ca" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="bm-dash" x1="18" y1="58" x2="62" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3" />
            <stop offset="1" stopColor="white" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="80" height="80" rx="20" fill="url(#bm-bg)" />
        {/* Top gloss */}
        <rect x="0" y="0" width="80" height="36" rx="20" fill="white" opacity="0.07" />

        {/* Dashed arc route */}
        <path
          d="M 20 58 Q 24 34 60 22"
          stroke="url(#bm-dash)"
          strokeWidth="2"
          strokeDasharray="3.5 4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Origin dot — static outer ring */}
        <circle cx="20" cy="58" r="7" fill="white" opacity="0.15" />
        <circle cx="20" cy="58" r="4" fill="white" opacity="0.9" />

        {/* Destination dot — static outer ring */}
        <circle cx="60" cy="22" r="7" fill="white" opacity="0.15" />
        <circle cx="60" cy="22" r="4" fill="white" opacity="0.9" />
      </svg>

      {/* Pulse rings — rendered outside SVG so CSS animations work */}
      {/* Origin pulse */}
      <motion.div
        className="absolute rounded-full border border-white/50"
        style={{ width: 20, height: 20, left: 'calc(20/80 * 100% - 10px)', top: 'calc(58/80 * 100% - 10px)' }}
        animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute rounded-full border border-white/30"
        style={{ width: 20, height: 20, left: 'calc(20/80 * 100% - 10px)', top: 'calc(58/80 * 100% - 10px)' }}
        animate={{ scale: [1, 2.6], opacity: [0.3, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
      />

      {/* Destination pulse */}
      <motion.div
        className="absolute rounded-full border border-white/50"
        style={{ width: 20, height: 20, left: 'calc(60/80 * 100% - 10px)', top: 'calc(22/80 * 100% - 10px)' }}
        animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
      />
      <motion.div
        className="absolute rounded-full border border-white/30"
        style={{ width: 20, height: 20, left: 'calc(60/80 * 100% - 10px)', top: 'calc(22/80 * 100% - 10px)' }}
        animate={{ scale: [1, 2.6], opacity: [0.3, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
      />
    </div>
  );
}
