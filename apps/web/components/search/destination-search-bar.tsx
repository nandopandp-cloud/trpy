'use client';

import {
  useState, useRef, useEffect, useCallback, KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, MapPin, Clock, TrendingUp,
  Loader2, AlertCircle, ArrowUpRight,
} from 'lucide-react';
import { cn, toSlug } from '@/lib/utils';
import { useDestinationSearch, type SearchResult } from '@/hooks/useDestinationSearch';

// ─── Constantes ──────────────────────────────────────────────────────────────

const RECENT_KEY = 'trpy:recent_destinations';
const MAX_RECENT = 5;

const POPULAR: SearchResult[] = [
  { place_id: 'pop_paris',  main: 'Paris',           secondary: 'França',     description: 'Paris, França',           types: ['locality'] },
  { place_id: 'pop_bali',   main: 'Bali',            secondary: 'Indonésia',  description: 'Bali, Indonésia',          types: ['locality'] },
  { place_id: 'pop_toquio', main: 'Tóquio',          secondary: 'Japão',      description: 'Tóquio, Japão',           types: ['locality'] },
  { place_id: 'pop_rj',     main: 'Rio de Janeiro',  secondary: 'Brasil',     description: 'Rio de Janeiro, Brasil',  types: ['locality'] },
  { place_id: 'pop_ny',     main: 'Nova York',       secondary: 'EUA',        description: 'Nova York, EUA',          types: ['locality'] },
  { place_id: 'pop_lisbon', main: 'Lisboa',          secondary: 'Portugal',   description: 'Lisboa, Portugal',        types: ['locality'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSlug(result: SearchResult): string {
  return toSlug(result.description.replace(/,\s*/g, ' '));
}

function readRecent(): SearchResult[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as SearchResult[]; }
  catch { return []; }
}

function saveRecent(result: SearchResult) {
  if (typeof window === 'undefined') return;
  try {
    const next = [result, ...readRecent().filter((r) => r.place_id !== result.place_id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* private mode — ignore */ }
}

function clearRecent() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_KEY);
}

// ─── Highlight ────────────────────────────────────────────────────────────────

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-transparent text-primary font-bold">{part}</mark>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({
  result, query, icon, isActive, onClick,
}: {
  result: SearchResult;
  query: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      // onPointerDown previne que o blur do input feche o dropdown antes
      // do onClick disparar. O onClick executa a navegação.
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        isActive ? 'bg-muted/80' : 'hover:bg-muted/50',
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
        isActive ? 'bg-primary/15' : 'bg-muted group-hover:bg-primary/10',
      )}>
        {icon ?? <MapPin className={cn('w-4 h-4 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-snug">
          <HighlightMatch text={result.main} query={query} />
        </p>
        {result.secondary && (
          <p className="text-xs text-muted-foreground truncate">{result.secondary}</p>
        )}
      </div>
      <ArrowUpRight className={cn(
        'w-3.5 h-3.5 shrink-0 transition-all',
        isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-60 text-muted-foreground',
      )} />
    </button>
  );
}

// ─── Dropdown (portal) ────────────────────────────────────────────────────────
// Renderizado via createPortal no document.body para escapar de qualquer
// stacking context pai (backdrop-blur, z-index de headers, overflow, etc.).

interface DropdownRect { top: number; left: number; width: number; }

interface DropdownProps {
  anchorRect: DropdownRect;
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  activeIndex: number;
  recent: SearchResult[];
  onSelect: (r: SearchResult) => void;
  onClearRecent: () => void;
}

function SearchDropdownPortal({
  anchorRect, query, results, loading, error,
  activeIndex, recent, onSelect, onClearRecent,
}: DropdownProps) {
  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && results.length > 0;
  const showEmpty   = hasQuery && !loading && results.length === 0 && !error;
  const showRecent  = !hasQuery && recent.length > 0;
  const showPopular = !hasQuery && recent.length === 0;

  const dropdown = (
    <motion.div
      key="search-dropdown"
      data-search-dropdown="true"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: anchorRect.top + 8,
        left: anchorRect.left,
        width: anchorRect.width,
        zIndex: 99999,
      }}
      className="bg-card border border-border rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden"
    >
      {/* Loading */}
      {loading && (
        <div className="px-4 py-3.5 flex items-center gap-2.5 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <p className="text-sm">Buscando destinos...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 py-3.5 flex items-center gap-2.5 text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Zero results */}
      {showEmpty && (
        <div className="px-4 py-6 text-center">
          <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum resultado para{' '}
            <span className="font-semibold text-foreground">"{query}"</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente um nome de cidade, país ou região.
          </p>
        </div>
      )}

      {/* Autocomplete results */}
      {showResults && !loading && (
        <div className="py-1">
          {results.map((r, i) => (
            <ResultRow
              key={r.place_id}
              result={r}
              query={query}
              isActive={i === activeIndex}
              onClick={() => onSelect(r)}
            />
          ))}
        </div>
      )}

      {/* Recent searches */}
      {showRecent && (
        <div className="py-2">
          <div className="flex items-center justify-between px-4 py-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Recentes
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={onClearRecent}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          </div>
          {recent.map((r, i) => (
            <ResultRow
              key={r.place_id}
              result={r}
              query=""
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
              isActive={i === activeIndex}
              onClick={() => onSelect(r)}
            />
          ))}
        </div>
      )}

      {/* Popular destinations */}
      {showPopular && (
        <div className="py-2">
          <div className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />
            Destinos populares
          </div>
          {POPULAR.map((r, i) => (
            <ResultRow
              key={r.place_id}
              result={r}
              query=""
              icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
              isActive={i === activeIndex}
              onClick={() => onSelect(r)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );

  return createPortal(dropdown, document.body);
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DestinationSearchBarProps {
  className?: string;
  placeholder?: string;
  onSelect?: (result: SearchResult, slug: string) => void;
  baseRoute?: string;
  autoFocus?: boolean;
}

export function DestinationSearchBar({
  className,
  placeholder = 'Buscar destinos, cidades, atrações...',
  onSelect,
  baseRoute = '/dashboard/destinations',
  autoFocus = false,
}: DestinationSearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [mounted, setMounted] = useState(false);

  // Posição do input na viewport — calculada dinamicamente para o portal
  const [anchorRect, setAnchorRect] = useState<DropdownRect>({ top: 0, left: 0, width: 0 });

  const { query, setQuery, results, loading, error, clear } = useDestinationSearch({
    debounce: 280,
    minLength: 2,
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setRecent(readRecent()); }, []);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  useEffect(() => { setActiveIndex(-1); }, [results]);

  // Recalcula a posição do anchor toda vez que o dropdown abre ou a janela
  // muda de tamanho (resize/scroll).
  const updateAnchorRect = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect({
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!focused) return;
    updateAnchorRect();
    window.addEventListener('resize', updateAnchorRect);
    window.addEventListener('scroll', updateAnchorRect, true);
    return () => {
      window.removeEventListener('resize', updateAnchorRect);
      window.removeEventListener('scroll', updateAnchorRect, true);
    };
  }, [focused, updateAnchorRect]);

  // Fecha ao clicar fora.
  // Precisamos checar tanto o container do input quanto o dropdown (que está
  // no body via portal) — identificado pelo atributo data-search-dropdown.
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Element;
      if (containerRef.current?.contains(target)) return;
      if (target.closest('[data-search-dropdown]')) return;
      setFocused(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const navigableList = results.length > 0
    ? results
    : query.trim().length === 0
      ? recent.length > 0 ? recent : POPULAR
      : [];

  const navigate = useCallback((result: SearchResult) => {
    const slug = buildSlug(result);
    saveRecent(result);
    setRecent(readRecent());
    clear();
    setFocused(false);
    onSelect?.(result, slug);
    router.push(`${baseRoute}/${slug}`);
  }, [router, baseRoute, onSelect, clear]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!focused) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, navigableList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && navigableList[activeIndex]) {
        navigate(navigableList[activeIndex]);
      } else if (query.trim()) {
        navigate({
          place_id: `typed_${Date.now()}`,
          main: query.trim(),
          secondary: '',
          description: query.trim(),
        });
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  }

  const showDropdown = focused && mounted;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input */}
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 3px rgba(16,185,129,0.18), 0 4px 20px rgba(0,0,0,0.08)'
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}
        transition={{ duration: 0.18 }}
        className={cn(
          'flex items-center gap-2.5 h-11 px-3.5 rounded-xl border bg-card transition-colors duration-200',
          focused ? 'border-primary/50' : 'border-border',
        )}
      >
        {loading && query.trim().length >= 2 ? (
          <Loader2 className="w-4 h-4 shrink-0 text-primary animate-spin" />
        ) : (
          <Search className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            focused ? 'text-primary' : 'text-muted-foreground',
          )} />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); updateAnchorRect(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              type="button"
              onClick={() => { clear(); inputRef.current?.focus(); }}
              className="w-5 h-5 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted-foreground/20 transition-colors shrink-0"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dropdown — renderizado no body via portal */}
      <AnimatePresence>
        {showDropdown && (
          <SearchDropdownPortal
            anchorRect={anchorRect}
            query={query}
            results={results}
            loading={loading}
            error={error}
            activeIndex={activeIndex}
            recent={recent}
            onSelect={navigate}
            onClearRecent={() => { clearRecent(); setRecent([]); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Full-screen modal (mobile) ───────────────────────────────────────────────

interface DestinationSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function DestinationSearchModal({ open, onClose }: DestinationSearchModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
          className="bg-background flex flex-col"
        >
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0"
          >
            <DestinationSearchBar
              className="flex-1"
              autoFocus
              onSelect={onClose}
            />
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Cancelar
            </button>
          </motion.div>

          <div className="flex-1 flex flex-col items-center justify-start px-4 pt-10 gap-2">
            <Search className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Busque por cidades, países, regiões ou pontos turísticos em qualquer lugar do mundo
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
