'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Home, Settings,
  ChevronLeft, PlaneTakeoff, Heart,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useLocale, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [locale] = useLocale();

  const NAV = [
    { href: '/dashboard', label: t(locale, 'nav.inicio'), icon: Home, exact: true },
    { href: '/dashboard/trips', label: t(locale, 'nav.viagens'), icon: PlaneTakeoff },
    { href: '/dashboard/budget', label: t(locale, 'nav.financas'), icon: Wallet },
    { href: '/dashboard/favorites', label: t(locale, 'nav.favoritos'), icon: Heart },
  ];

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-card border-r border-border overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center shrink-0">
          <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="font-semibold text-lg text-foreground tracking-tighter uppercase whitespace-nowrap"
            >
              TRPY
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150',
                  active
                    ? 'bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted/60'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  />
                )}

                <div className={cn(
                  'relative z-10 w-5 h-5 flex items-center justify-center shrink-0',
                  active && 'drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]'
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 space-y-1 border-t border-border pt-3 shrink-0">
        <Link href="/dashboard/settings">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted/60 cursor-pointer transition-colors"
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {t(locale, 'nav.configuracoes')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>

        <div className={cn(
          'flex items-center px-3 py-2',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          <ThemeToggle />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground"
              >
                {t(locale, 'common.theme')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[72px] z-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted hover:scale-110 transition-all shadow-sm"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
