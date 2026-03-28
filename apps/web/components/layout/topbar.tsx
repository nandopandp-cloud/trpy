'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TITLES: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/dashboard/trips': 'Minhas Viagens',
  '/dashboard/budget': 'Finanças',
  '/dashboard/ai': 'Assistente IA',
  '/dashboard/settings': 'Configurações',
};

function getTitle(pathname: string) {
  if (pathname.match(/\/dashboard\/trips\/[^/]+\/edit/)) return 'Editar Viagem';
  if (pathname.match(/\/dashboard\/trips\/new/)) return 'Nova Viagem';
  if (pathname.match(/\/dashboard\/trips\/[^/]+/)) return 'Detalhes da Viagem';
  return TITLES[pathname] ?? 'Trpy';
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 px-6 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-10"
    >
      <h2 className="font-semibold text-foreground text-base">{title}</h2>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </Button>

        {/* Avatar placeholder */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          D
        </button>
      </div>
    </motion.header>
  );
}
