'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

type Props = {
  onDone: () => void;
};

export function OnboardingComplete({ onDone }: Props) {
  const router = useRouter();

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#6366f1', '#f59e0b', '#10b981', '#a78bfa'],
    });
  }, []);

  function handleCreate() {
    onDone();
    router.push('/dashboard/trips/new');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/75 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25"
        >
          <span className="text-3xl">🎉</span>
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-3">Você está pronto!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Agora é só começar a planejar suas próximas aventuras. O mundo está esperando por você!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Criar minha primeira viagem ✈️
          </button>
          <button
            onClick={onDone}
            className="w-full py-3 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Explorar o dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
