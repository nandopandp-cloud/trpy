'use client';

import { motion } from 'framer-motion';
import { TrpyBrandMark } from './trpy-brand-mark';

type Props = {
  onStart: () => void;
  onSkip: () => void;
};

export function OnboardingWelcome({ onStart, onSkip }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/75 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl"
      >
        {/* Brand mark */}
        <div className="w-20 h-20 mx-auto mb-6">
          <TrpyBrandMark />
        </div>

        {/* Text */}
        <h1 id="welcome-title" className="text-2xl font-bold text-foreground mb-3">
          Bem-vindo à Trpy! 🌍
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Em menos de um minuto você vai conhecer tudo que precisa para planejar viagens incríveis. Vamos lá?
        </p>

        {/* Progress dots preview */}
        <div className="flex justify-center gap-1.5 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`rounded-full transition-all ${i === 0 ? 'w-4 h-2 bg-indigo-500' : 'w-2 h-2 bg-border'}`}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onStart}
            className="px-8 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Começar o tour ✨
          </button>
          <button
            onClick={onSkip}
            className="px-8 py-3 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Pular
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
