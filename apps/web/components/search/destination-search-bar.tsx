'use client';

import {
  useState, useRef, useEffect, useCallback, KeyboardEvent,
} from 'react';
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

// Sugestões populares exibidas quando o campo está vazio
const POPULAR: SearchResult[] = [
  { place_id: 'pop_paris', main: 'Paris', secondary: 'França', description: 'Paris, França', types: ['locality'] },
  { place_id: 'pop_bali', main: 'Bali', secondary: 'Indonésia', description: 'Bali, Indonésia', types: ['locality'] },
  { place_id: 'pop_toquio', main: 'Tóquio', secondary: 'Japão', description: 'Tóquio, Japão', types: ['locality'] },
  { place_id: 'pop_rj', main: 'Rio de Janeiro', secondary: 'Brasil', description: 'Rio de Janeiro, Brasil', types: ['locality'] },
  { place_id: 'pop_ny', main: 'Nova York', secondary: 'EUA', description: 'Nova York, EUA', types: ['locality'] },
  { place_id: 'pop_lisbon', main: 'Lisboa', secondary: 'Portugal', description: 'Lisboa, Portugal', types: ['locality'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSlug(result: SearchResult): string {
  // "Rio de Janeiro, Brasil" → "rio-de-janeiro-brasil"
  return toSlug(result.description.replace(/,\s*/g, ' '));
}

function readRecent(): SearchResult[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as SearchResult[];
  } catch {
    return [];
  }
}

function saveRecent(result: SearchResult) {
  if (typeof window === 'undefined') return;
  try {
    const existing = readRecent().filter((r) => r.place_id !== result.place_id);
    const updated = [result, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage can throw in private mode — fail silently
  }
}

function clearRecent() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_KEY);
}

// ─── Highlight — marca o texto digitado em negrito no resultado ──────────────

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
  result,
  query,
  icon,
  isActive,
  onClick,
}: {
  result: SearchResult;
  query: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
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
    </motion.button>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  activeIndex: number;
  recent: SearchResult[];
  onSelect: (r: SearchResult) => void;
  onClearRecent: () => void;
}

function SearchDropdown({
  query,
  results,
  loading,
  error,
  activeIndex,
  recent,
  onSelect,
  onClearRecent,
}: DropdownProps) {
  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && results.length > 0;
  const showEmpty = hasQuery && !loading && results.length === 0;
  const showRecent = !hasQuery && recent.length > 0;
  const showPopular = !hasQuery && recent.length === 0;

  return (
    <motion.div
      key="dropdown"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-50"
    >
      {/* Loading skeleton */}
      {loading && (
        <div className="px-4 py-3 flex items-center gap-2.5 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <p className="text-sm">Buscando destinos...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 py-3 flex items-center gap-2.5 text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Zero results */}
      {showEmpty && !error && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum resultado para <span className="font-semibold text-foreground">"{query}"</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tente um nome de cidade, país ou região.</p>
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
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DestinationSearchBarProps {
  /** className aplicada ao wrapper externo */
  className?: string;
  /** Placeholder do input */
  placeholder?: string;
  /** Callback extra chamado após seleção (além da navegação) */
  onSelect?: (result: SearchResult, slug: string) => void;
  /** Rota base de navegação — default: /dashboard/destinations */
  baseRoute?: string;
  /** Se true, o componente auto-foca ao montar */
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

  const { query, setQuery, results, loading, error, clear } = useDestinationSearch({
    debounce: 300,
    minLength: 2,
  });

  // Lê recentes ao montar (client-only)
  useEffect(() => { setRecent(readRecent()); }, []);

  // Auto-foco opcional
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index quando os resultados mudam
  useEffect(() => { setActiveIndex(-1); }, [results]);

  const showDropdown = focused && !loading
    ? focused
    : focused && loading && query.trim().length >= 2;

  // Lista que o teclado deve navegar (resultados, recentes ou populares)
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
        // Navegação direta pelo nome digitado
        const synthetic: SearchResult = {
          place_id: `typed_${Date.now()}`,
          main: query.trim(),
          secondary: '',
          description: query.trim(),
        };
        navigate(synthetic);
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  }

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
          onFocus={() => setFocused(true)}
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

      {/* Dropdown */}
      <AnimatePresence>
        {focused && (
          <SearchDropdown
            query={query}
            results={results}
            loading={loading}
            error={error}
            activeIndex={activeIndex}
            recent={recent}
            onSelect={navigate}
            onClearRecent={() => {
              clearRecent();
              setRecent([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Full-screen modal variant (mobile) ──────────────────────────────────────
// Usada pelo Topbar em telas pequenas para dar mais espaço ao input.

interface DestinationSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function DestinationSearchModal({ open, onClose }: DestinationSearchModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9998] bg-background/95 backdrop-blur-sm flex flex-col"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
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

          {/* Hint area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Digite o nome de uma cidade, país, região ou ponto turístico
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
