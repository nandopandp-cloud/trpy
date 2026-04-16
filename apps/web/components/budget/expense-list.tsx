'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Home, Utensils, Bus, Zap, ShoppingBag, Heart, MoreHorizontal,
  Edit2, Trash2, ChevronDown, Search, Filter, AlertTriangle, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Expense } from '@trpy/database';
import { ExpenseForm } from './expense-form';

/* ── Config ───────────────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  dot: string;
}> = {
  ACCOMMODATION: { label: 'Hospedagem',  icon: Home,            color: 'text-blue-400',    bg: 'bg-blue-500/10',    dot: 'bg-blue-400' },
  FOOD:          { label: 'Alimentação', icon: Utensils,        color: 'text-amber-400',   bg: 'bg-amber-500/10',   dot: 'bg-amber-400' },
  TRANSPORT:     { label: 'Transporte',  icon: Bus,             color: 'text-violet-400',  bg: 'bg-violet-500/10',  dot: 'bg-violet-400' },
  ACTIVITIES:    { label: 'Atividades',  icon: Zap,             color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  SHOPPING:      { label: 'Compras',     icon: ShoppingBag,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    dot: 'bg-rose-400' },
  HEALTH:        { label: 'Saúde',       icon: Heart,           color: 'text-red-400',     bg: 'bg-red-500/10',     dot: 'bg-red-400' },
  OTHER:         { label: 'Outros',      icon: MoreHorizontal,  color: 'text-slate-400',   bg: 'bg-slate-500/10',   dot: 'bg-slate-400' },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);

/* ── Delete Confirm Dialog ─────────────────────────────────────────────────── */

interface DeleteConfirmProps {
  expense: Expense;
  tripId: string;
  onCancel: () => void;
  onDeleted: () => void;
}

function DeleteConfirm({ expense, tripId, onCancel, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erro ao excluir despesa');
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      toast.success('Despesa excluída', { description: expense.title });
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir despesa');
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="mx-2 mt-1 mb-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Excluir despesa?</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            "{expense.title}" será removida permanentemente.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 h-8 rounded-lg border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-8 rounded-lg bg-destructive text-xs font-semibold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {deleting ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Excluindo...</>
              ) : (
                <><Trash2 className="w-3 h-3" /> Excluir</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Expense Row ───────────────────────────────────────────────────────────── */

interface ExpenseRowProps {
  expense: Expense;
  tripId: string;
  onEdit: () => void;
}

function ExpenseRow({ expense, tripId, onEdit }: ExpenseRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const config = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.OTHER;
  const Icon = config.icon;

  return (
    <div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
        className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors rounded-2xl"
      >
        {/* Icon */}
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">{expense.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', config.bg, config.color)}>
              {config.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(expense.date), "d MMM yyyy", { locale: ptBR })}
            </span>
            {expense.notes && (
              <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">
                {expense.notes}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground">
            {expense.currency} {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            title="Editar despesa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir despesa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Inline delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirm
            expense={expense}
            tripId={tripId}
            onCancel={() => setConfirmDelete(false)}
            onDeleted={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */

interface ExpenseListProps {
  expenses: Expense[];
  tripId: string;
}

export function ExpenseList({ expenses, tripId }: ExpenseListProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAll, setShowAll] = useState(false);

  const INITIAL_LIMIT = 8;

  // Filter
  const filtered = expenses.filter((e) => {
    const matchesSearch = search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);
  const hasMore = filtered.length > INITIAL_LIMIT && !showAll;

  if (expenses.length === 0) return null;

  return (
    <>
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">Todas as despesas</p>
            <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {expenses.length}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
              showFilters || activeCategory
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtrar
            {activeCategory && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Search + Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="px-4 pt-3 pb-3 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar despesa..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {/* Category filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                      !activeCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Todas
                  </button>
                  {ALL_CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                          activeCategory === cat
                            ? cn(cfg.bg, cfg.color, 'ring-1 ring-current/30')
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count when filtering */}
        {(search || activeCategory) && (
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              {activeCategory && ` em ${CATEGORY_CONFIG[activeCategory]?.label}`}
            </p>
          </div>
        )}

        {/* Expense list */}
        <div className="py-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma despesa encontrada</p>
              {(search || activeCategory) && (
                <button
                  onClick={() => { setSearch(''); setActiveCategory(null); }}
                  className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {displayed.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  tripId={tripId}
                  onEdit={() => setEditingExpense(expense)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Show more / Show less */}
        {filtered.length > INITIAL_LIMIT && (
          <div className="border-t border-border">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <motion.div animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
              {showAll ? 'Mostrar menos' : `Ver mais ${filtered.length - INITIAL_LIMIT} despesa${filtered.length - INITIAL_LIMIT !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingExpense && (
          <ExpenseForm
            tripId={tripId}
            expense={editingExpense}
            onClose={() => setEditingExpense(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
