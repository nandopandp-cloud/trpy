'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, User, LogOut, ChevronRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user/user-avatar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { useLocale, t } from '@/lib/i18n';

const TITLES: Record<string, string> = {
  '/dashboard': 'page.dashboard',
  '/dashboard/trips': 'page.trips',
  '/dashboard/budget': 'page.budget',
  '/dashboard/favorites': 'page.favorites',
  '/dashboard/settings': 'page.settings',
};

function getTitle(pathname: string): string {
  if (pathname.match(/\/dashboard\/trips\/[^/]+\/edit/)) return 'page.edit-trip';
  if (pathname.match(/\/dashboard\/trips\/new/)) return 'page.new-trip';
  if (pathname.match(/\/dashboard\/trips\/[^/]+/)) return 'page.trip-details';
  if (pathname.match(/\/dashboard\/destinations\/[^/]+/)) return 'page.destination';
  if (pathname === '/dashboard/destinations') return 'page.explore';
  return TITLES[pathname] ?? 'Trpy';
}

// ─── Reusable menu actions ────────────────────────────────────────────────────

function MenuActions({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [locale] = useLocale();

  function navigate(href: string) {
    onClose?.();
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => navigate('/dashboard/settings')}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-xl transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{t(locale, 'common.profile')}</p>
          <p className="text-xs text-muted-foreground">{t(locale, 'common.account')}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <button
        onClick={() => navigate('/dashboard/settings')}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-xl transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center shrink-0">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{t(locale, 'page.settings')}</p>
          <p className="text-xs text-muted-foreground">{t(locale, 'topbar.settings_hint')}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
    </>
  );
}

// ─── Desktop dropdown ─────────────────────────────────────────────────────────

function DesktopUserMenu({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const [locale] = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Menu do usuário"
          />
        }
      >
        <UserAvatar name={user.name} email={user.email} image={user.image} size="md" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl p-1.5"
      >
        {/* User info header */}
        <div className="flex items-center gap-3 px-2 py-2.5">
          <UserAvatar name={user.name} email={user.email} image={user.image} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name ?? 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email ?? ''}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          className="gap-2.5 rounded-xl py-2 px-2.5 cursor-pointer"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          {t(locale, 'common.profile')}
        </DropdownMenuItem>

        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          className="gap-2.5 rounded-xl py-2 px-2.5 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          {t(locale, 'page.settings')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">{t(locale, 'common.theme')}</span>
          <ThemeToggle showLabel />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
          variant="destructive"
          className="gap-2.5 rounded-xl py-2 px-2.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t(locale, 'common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Mobile bottom sheet ──────────────────────────────────────────────────────

function MobileUserMenu({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const [open, setOpen] = useState(false);
  const [locale] = useLocale();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Menu do usuário"
          />
        }
      >
        <UserAvatar name={user.name} email={user.email} image={user.image} size="md" />
      </SheetTrigger>

      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-3xl border-t border-border gap-0 p-0">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* User header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
          <UserAvatar name={user.name} email={user.email} image={user.image} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground truncate">{user.name ?? 'Usuário'}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email ?? ''}</p>
          </div>
          <SheetClose
            render={<button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0" />}
          >
            ✕
          </SheetClose>
        </div>

        {/* Menu items */}
        <div className="px-3 py-2 space-y-0.5">
          <MenuActions onClose={() => setOpen(false)} />
        </div>

        {/* Theme row */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border mx-3 rounded-2xl bg-muted/30 mb-2">
          <span className="text-sm font-semibold text-foreground">{t(locale, 'common.theme')}</span>
          <ThemeToggle showLabel />
        </div>

        {/* Sign out */}
        <div className="px-3 pb-safe pb-6">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-destructive/10 hover:bg-destructive/15 text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-semibold">{t(locale, 'common.logout')}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar() {
  const pathname = usePathname();
  const [locale] = useLocale();
  const titleKey = getTitle(pathname);
  const title = titleKey === 'Trpy' ? titleKey : t(locale, titleKey as any);
  const { data: session } = useSession();
  const user = session?.user ?? {};

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-border bg-card/70 backdrop-blur-xl sticky top-0 z-10"
    >
      {/* Left: logo on mobile, page title on desktop */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Logo href="/dashboard" size="sm" hideText={true} />
        </div>
        <h2 className="hidden md:block font-medium text-foreground text-base tracking-tight">{title}</h2>
      </div>

      {/* Right: avatar */}
      <div className="flex items-center gap-2">
        {/* Desktop dropdown (hidden on mobile) */}
        <div className="hidden md:block">
          <DesktopUserMenu user={user} />
        </div>

        {/* Mobile bottom sheet (hidden on desktop) */}
        <div className="md:hidden">
          <MobileUserMenu user={user} />
        </div>
      </div>
    </motion.header>
  );
}
