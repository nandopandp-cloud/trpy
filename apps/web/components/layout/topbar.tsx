'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  const isHome = pathname === '/dashboard';

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-border bg-card/70 backdrop-blur-xl sticky top-0 z-10"
    >
      {/* Logo on mobile */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-ocean flex items-center justify-center glow-teal">
            <Map className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-gradient-ocean">Trpy</span>
        </Link>
        <h2 className="hidden md:block font-bold text-foreground text-base">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </Button>

        {/* Avatar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-xl bg-ocean flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/15 hover:ring-primary/35 transition-all"
        >
          D
        </motion.button>
      </div>
    </motion.header>
  );
}
