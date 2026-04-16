'use client';

import {
  createContext, useCallback, useContext, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, LogOut, X, ShieldAlert, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** Small detail shown below description, e.g. the item name */
  detail?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/* ── Context ────────────────────────────────────────────────────────────────── */

const ConfirmContext = createContext<{
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
} | null>(null);

/* ── Variant config ─────────────────────────────────────────────────────────── */

const VARIANT_CONFIG = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    confirmClass: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20',
    ring: 'ring-destructive/20',
    glow: 'from-destructive/5 via-transparent to-transparent',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    confirmClass: 'bg-amber-500 hover:bg-amber-500/90 text-white shadow-lg shadow-amber-500/20',
    ring: 'ring-amber-500/20',
    glow: 'from-amber-500/5 via-transparent to-transparent',
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    confirmClass: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20',
    ring: 'ring-primary/20',
    glow: 'from-primary/5 via-transparent to-transparent',
  },
} as const;

/* ── Dialog Component ───────────────────────────────────────────────────────── */

function ConfirmDialogUI({ state, onClose }: { state: ConfirmState; onClose: (value: boolean) => void }) {
  const variant = state.variant ?? 'danger';
  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.icon;
  const confirmLabel = state.confirmLabel ?? (variant === 'danger' ? 'Excluir' : 'Confirmar');
  const cancelLabel = state.cancelLabel ?? 'Cancelar';

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose(false)}
    >
      <motion.div
        key="panel"
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.8 }}
        className={cn(
          'relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden',
          'ring-1', cfg.ring,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle gradient top glow matching variant */}
        <div className={cn(
          'absolute inset-x-0 top-0 h-32 bg-gradient-to-b pointer-events-none',
          cfg.glow,
        )} />

        {/* Close button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative p-7 pb-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.07, type: 'spring', stiffness: 600, damping: 28 }}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
              cfg.iconBg,
            )}
          >
            <Icon className={cn('w-6 h-6', cfg.iconColor)} strokeWidth={1.8} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-foreground leading-tight"
          >
            {state.title}
          </motion.h2>

          {/* Description */}
          {state.description && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="text-sm text-muted-foreground mt-2 leading-relaxed"
            >
              {state.description}
            </motion.p>
          )}

          {/* Detail pill — item name or extra info */}
          {state.detail && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border"
            >
              <span className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                {state.detail}
              </span>
            </motion.div>
          )}

          {/* Divider */}
          <div className="h-px bg-border mt-6 mb-5" />

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex gap-3"
          >
            <button
              onClick={() => onClose(false)}
              className="flex-1 h-11 rounded-2xl border border-border bg-muted/50 hover:bg-muted text-sm font-semibold text-foreground transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => onClose(true)}
              className={cn(
                'flex-1 h-11 rounded-2xl text-sm font-semibold transition-all active:scale-95',
                cfg.confirmClass,
              )}
            >
              {confirmLabel}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Provider ───────────────────────────────────────────────────────────────── */

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, resolve });
    });
  }, []);

  function handleClose(value: boolean) {
    resolveRef.current?.(value);
    setState(null);
  }

  const portal = typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {state && <ConfirmDialogUI state={state} onClose={handleClose} />}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {portal}
    </ConfirmContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return ctx.confirm;
}
