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

type MobileCardProps = Props & { isMobile: true };

function MobileBottomSheet({ step, currentIndex, totalSteps, onNext, onPrevious, onSkip }: MobileCardProps) {
  const Icon = step.icon;
  const StepImage = STEP_IMAGES[step.mobileImageKey];
  const progress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  // Motion values for drag feedback
  const x = useMotionValue(0);
  const cardOpacity = useTransform(x, [-120, 0, 120], [0.4, 1, 0.4]);
  const cardRotate = useTransform(x, [-120, 0, 120], [-4, 0, 4]);
  const cardScale = useTransform(x, [-120, 0, 120], [0.96, 1, 0.96]);

  // Direction hint arrows that appear while dragging
  const leftHintOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rightHintOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const isDragging = useRef(false);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    isDragging.current = false;
    const vx = info.offset.x;
    if (vx < -SWIPE_THRESHOLD) {
      // Snap out to the left then call onNext
      animate(x, -window.innerWidth, { duration: 0.22, ease: [0.4, 0, 1, 1] }).then(() => {
        onNext();
      });
    } else if (vx > SWIPE_THRESHOLD && currentIndex > 0) {
      animate(x, window.innerWidth, { duration: 0.22, ease: [0.4, 0, 1, 1] }).then(() => {
        onPrevious();
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }

  return (
    <motion.div
      key={`mobile-sheet-${step.id}`}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 left-0 right-0 z-10"
    >
      {/* Drag direction hints */}
      <motion.div
        style={{ opacity: rightHintOpacity }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center pointer-events-none z-20"
      >
        <ChevronLeft className="w-5 h-5 text-indigo-400" />
      </motion.div>
      <motion.div
        style={{ opacity: leftHintOpacity }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center pointer-events-none z-20"
      >
        <ChevronRight className="w-5 h-5 text-indigo-400" />
      </motion.div>

      {/* The draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.15}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
        style={{ x, opacity: cardOpacity, rotate: cardRotate, scale: cardScale }}
        className="bg-card border-t border-border rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 cursor-grab active:cursor-grabbing"
        // Prevent text selection while dragging
        onPointerDown={(e) => e.preventDefault()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />

        {/* Step counter + close */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
            {currentIndex + 1} / {totalSteps}
          </span>
          <button
            onClick={onSkip}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground active:scale-95 transition-all"
            aria-label="Fechar tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: `${(currentIndex / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step illustration — swipe hint label on first step */}
        <div className="w-full rounded-2xl overflow-hidden mb-4 border border-border/40 relative" style={{ aspectRatio: '2 / 1' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.mobileImageKey}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <StepImage />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-base font-bold text-foreground leading-tight">{step.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.description}</p>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3" onPointerDown={(e) => e.stopPropagation()}>
          {currentIndex > 0 ? (
            <button
              onClick={onPrevious}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-foreground font-semibold text-sm active:scale-95 transition-all"
              aria-label="Passo anterior"
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
      </motion.div>
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

        {/* ── DESKTOP: thin progress bar on top ── */}
        {!isMobile && (
          <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/10 z-10">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: `${(currentIndex / totalSteps) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        {/* ── DESKTOP tooltip card ── */}
        {!isMobile && (
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
        )}

        {/* ── MOBILE: swipeable bottom sheet ── */}
        {isMobile && (
          <MobileBottomSheet
            isMobile={true}
            step={step}
            currentIndex={currentIndex}
            totalSteps={totalSteps}
            onNext={onNext}
            onPrevious={onPrevious}
            onSkip={onSkip}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
