'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CYCLE: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const LABELS = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
};

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const current = (theme as 'system' | 'light' | 'dark') ?? 'system';
  const Icon = ICONS[current] ?? Monitor;

  function cycle() {
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
  }

  return (
    <button
      onClick={cycle}
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors ${showLabel ? 'px-3 py-2' : 'w-9 h-9 justify-center'} ${className ?? ''}`}
      aria-label={`Tema: ${LABELS[current]}. Clique para alternar.`}
      title={`Tema: ${LABELS[current]}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="flex items-center"
        >
          <Icon className={`w-4 h-4 ${current === 'dark' ? 'text-indigo-400' : current === 'light' ? 'text-amber-500' : 'text-muted-foreground'}`} />
        </motion.span>
      </AnimatePresence>
      {showLabel && (
        <span className="text-xs font-medium text-foreground">{LABELS[current]}</span>
      )}
    </button>
  );
}
