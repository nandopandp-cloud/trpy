'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PlaneTakeoff, Heart, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Início', icon: Home, exact: true },
  { href: '/dashboard/trips', label: 'Viagens', icon: PlaneTakeoff },
  { href: '/dashboard/budget', label: 'Finanças', icon: Wallet },
  { href: '/dashboard/favorites', label: 'Favoritos', icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-card/80 backdrop-blur-xl border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-1 py-1.5 px-2 rounded-2xl relative"
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-active"
                      className="absolute inset-0 rounded-2xl bg-primary/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                  <div className={cn(
                    'relative z-10 w-6 h-6 flex items-center justify-center transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'relative z-10 text-[10px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
