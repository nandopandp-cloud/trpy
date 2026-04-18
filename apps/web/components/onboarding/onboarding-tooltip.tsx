'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type OnboardingStep } from './onboarding-steps';

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
};

const TOOLTIP_W = 340;
const TOOLTIP_H = 220;
const OFFSET = 16;

function calcTooltipPos(rect: Rect, position: OnboardingStep['position']) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0;
  let left = 0;

  switch (position) {
    case 'bottom':
      top = rect.top + rect.height + OFFSET;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      break;
    case 'top':
      top = rect.top - TOOLTIP_H - OFFSET;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.left + rect.width + OFFSET;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.left - TOOLTIP_W - OFFSET;
      break;
  }

  // Clamp inside viewport
  top = Math.max(12, Math.min(top, vh - TOOLTIP_H - 12));
  left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));

  return { top, left };
}

export function OnboardingTooltip({ step, currentIndex, totalSteps, onNext, onPrevious, onSkip }: Props) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const measureTarget = useCallback(() => {
    const el = document.querySelector(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step.target]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    return () => window.removeEventListener('resize', measureTarget);
  }, [measureTarget]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onPrevious();
      if (e.key === 'Escape') onSkip();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrevious, onSkip, currentIndex]);

  const Icon = step.icon;

  // Tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (isMobile || !targetRect) {
    // Mobile: fixed to bottom of screen
    tooltipStyle = { position: 'fixed', bottom: 90, left: 12, right: 12, width: 'auto' };
  } else {
    const pos = calcTooltipPos(targetRect, step.position);
    tooltipStyle = { position: 'fixed', top: pos.top, left: pos.left, width: TOOLTIP_W };
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        role="dialog"
        aria-modal="true"
        aria-label={`Passo ${currentIndex + 1} de ${totalSteps}: ${step.title}`}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-[2px]" />

        {/* Spotlight highlight on target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              borderRadius: 14,
              boxShadow: '0 0 0 3px rgba(99,102,241,0.7), 0 0 0 9999px rgba(0,0,0,0.65)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-border z-10">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: `${(currentIndex / totalSteps) * 100}%` }}
            animate={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Tooltip card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={tooltipStyle}
          className="bg-card border border-border rounded-2xl p-5 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label="Fechar tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-4 h-1.5 bg-indigo-500' : 'w-1.5 h-1.5 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={onPrevious}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Passo anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                aria-label={currentIndex < totalSteps - 1 ? 'Próximo passo' : 'Concluir tour'}
              >
                {currentIndex < totalSteps - 1 ? (
                  <>Próximo <ChevronRight className="w-3.5 h-3.5" /></>
                ) : (
                  'Concluir 🎉'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
