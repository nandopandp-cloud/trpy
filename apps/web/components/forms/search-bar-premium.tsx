'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  label: string;
  sub?: string;
}

interface SearchBarPremiumProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestions?: Suggestion[];
  onSuggestionSelect?: (s: Suggestion) => void;
  className?: string;
}

export function SearchBarPremium({
  value,
  onChange,
  placeholder = 'Buscar destinos, viagens...',
  suggestions = [],
  onSuggestionSelect,
  className,
}: SearchBarPremiumProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && suggestions.length > 0 && value.length > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input */}
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 3px rgba(16,185,129,0.20), 0 8px 24px rgba(0,0,0,0.10)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-3 h-14 px-4 rounded-2xl border bg-card transition-colors duration-200',
          focused ? 'border-primary/50' : 'border-border'
        )}
      >
        <motion.div animate={{ scale: focused ? 1.1 : 1, color: focused ? '#10B981' : undefined }}>
          <Search className={cn('w-5 h-5 shrink-0 transition-colors', focused ? 'text-primary' : 'text-muted-foreground')} />
        </motion.div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { onChange(''); inputRef.current?.focus(); }}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-card-lg overflow-hidden z-50"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  onSuggestionSelect?.(s);
                  onChange(s.label);
                  setFocused(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.label}</p>
                  {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
