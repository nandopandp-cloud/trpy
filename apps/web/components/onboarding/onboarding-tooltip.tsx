'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type OnboardingStep } from './onboarding-steps';
import {
  StepImageNewTrip,
  StepImageTrips,
  StepImageBudget,
  StepImageFavorites,
  StepImageSettings,
} from './onboarding-step-images';

const STEP_IMAGES: Record<OnboardingStep['mobileImageKey'], React.ComponentType> = {
  'new-trip': StepImageNewTrip,
  'trips': StepImageTrips,
  'budget': StepImageBudget,
  'favorites': StepImageFavorites,
  'settings': StepImageSettings,
};

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
const SWIPE_THRESHOLD = 60;

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

  top = Math.max(12, Math.min(top, vh - TOOLTIP_H - 12));
  left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));

  return { top, left };
}

// ── Mobile swipeable bottom sheet ──────────────────────────────────────────────
// Strategy: the sheet itself slides up once and stays fixed.
// Only the inner step content (image + icon + title + description) swipes.
// Progress bar, counter, close, dots and buttons are always visible.

type MobileCardProps = Props & { isMobile: true };

function MobileBottomSheet({ step, currentIndex, totalSteps, onNext, onPrevious, onSkip }: MobileCardProps) {
  const Icon = step.icon;
  const StepImage = STEP_IMAGES[step.mobileImageKey];
  const progress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  // Drag x — shared by draggable container + visual content
  const x = useMotionValue(0);
  const dragOpacity = useTransform(x, [-140, 0, 140], [0.35, 1, 0.35]);

  // Content opacity — fades during step transition (separate from drag)
  const contentOpacity = useMotionValue(1);

  // Hint arrows
  const leftArrowOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const rightArrowOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const swipeDir = useRef<'left' | 'right'>('left');
  const isTransitioning = useRef(false);

  // When step changes (from button click or swipe), fade content out then in
  // The container/card itself NEVER moves — only content opacity transitions
  useEffect(() => {
    if (isTransitioning.current) return;
    // Already handled by swipe animation path; this covers button-click navigation
    animate(contentOpacity, 0, { duration: 0.12 }).then(() => {
      animate(contentOpacity, 1, { duration: 0.2, ease: [0.16, 1, 0.3, 1] });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    const dx = info.offset.x;
    if (dx < -SWIPE_THRESHOLD) {
      swipeDir.current = 'left';
      isTransitioning.current = true;
      animate(x, -window.innerWidth, { duration: 0.18, ease: [0.4, 0, 1, 1] }).then(() => {
        x.set(0);
        isTransitioning.current = false;
        onNext();
      });
    } else if (dx > SWIPE_THRESHOLD && currentIndex > 0) {
      swipeDir.current = 'right';
      isTransitioning.current = true;
      animate(x, window.innerWidth, { duration: 0.18, ease: [0.4, 0, 1, 1] }).then(() => {
        x.set(0);
        isTransitioning.current = false;
        onPrevious();
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 36 });
    }
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-10 bg-card flex flex-col"
    >
      {/* ── Header — static, never moves ── */}
      <div className="px-5 pt-4 pb-0 shrink-0">
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
            {currentIndex + 1} / {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground active:scale-95 transition-all"
            aria-label="Fechar tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-hidden relative">
        {/* Hint arrows */}
        <motion.div style={{ opacity: rightArrowOpacity }}
          className="absolute left-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center pointer-events-none z-20">
          <ChevronLeft className="w-4 h-4 text-indigo-400" />
        </motion.div>
        <motion.div style={{ opacity: leftArrowOpacity }}
          className="absolute right-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center pointer-events-none z-20">
          <ChevronRight className="w-4 h-4 text-indigo-400" />
        </motion.div>

        {/*
          NO key prop — this element NEVER remounts.
          x drives drag movement + opacity fade.
          contentOpacity drives step-change cross-fade independently.
          Both are motion values, no React re-render involved.
        */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.22}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x, opacity: dragOpacity }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Inner content — fades on step change, no position change */}
          <motion.div
            style={{ opacity: contentOpacity }}
            className="h-full px-5 pt-4 flex flex-col select-none"
          >
            {/* Illustration */}
            <div
              className="w-full rounded-2xl overflow-hidden border border-border/40 mb-4 shrink-0"
              style={{ aspectRatio: '2 / 1' }}
            >
              <StepImage />
            </div>

            {/* Icon + title + description */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-foreground leading-tight">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Footer — static, never moves ── */}
      <div className="px-5 pb-8 pt-3 shrink-0">
        <div className="flex gap-1.5 justify-center mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-border'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {currentIndex > 0 ? (
            <button
              onClick={onPrevious}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-foreground font-semibold text-sm active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="flex-1 flex items-center justify-center py-3.5 rounded-2xl border border-border text-muted-foreground font-medium text-sm active:scale-95 transition-all"
            >
              Pular tour
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm active:scale-95 transition-all"
          >
            {currentIndex < totalSteps - 1 ? <>Próximo <ChevronRight className="w-5 h-5" /></> : 'Concluir 🎉'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main tooltip component ──────────────────────────────────────────────────────

export function OnboardingTooltip({ step, currentIndex, totalSteps, onNext, onPrevious, onSkip }: Props) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const measureTarget = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
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
  const progress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  let desktopStyle: React.CSSProperties = {};
  if (!isMobile && targetRect) {
    const pos = calcTooltipPos(targetRect, step.position);
    desktopStyle = { position: 'fixed', top: pos.top, left: pos.left, width: TOOLTIP_W };
  }

  // ── MOBILE: render outside AnimatePresence — no remount ever ──
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-[9999]"
        role="dialog"
        aria-modal="true"
        aria-label={`Passo ${currentIndex + 1} de ${totalSteps}: ${step.title}`}
      >
        <MobileBottomSheet
          isMobile={true}
          step={step}
          currentIndex={currentIndex}
          totalSteps={totalSteps}
          onNext={onNext}
          onPrevious={onPrevious}
          onSkip={onSkip}
        />
      </div>
    );
  }

  // ── DESKTOP: AnimatePresence + key is fine — full card remounts on step change ──
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

        {/* Thin progress bar on top */}
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/10 z-10">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: `${(currentIndex / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Desktop tooltip card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={desktopStyle}
          className="bg-card border border-border rounded-2xl p-5 shadow-2xl z-10"
        >
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

          <div className="flex items-center justify-between">
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
              >
                {currentIndex < totalSteps - 1 ? <>Próximo <ChevronRight className="w-3.5 h-3.5" /></> : 'Concluir 🎉'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
