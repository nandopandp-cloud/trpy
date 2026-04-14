'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useCallback, useState, useEffect } from 'react';
import {
  ArrowRight, Sparkles, MapPin, Calendar, Users, Search,
  Compass, Shield, Star as StarIcon, Globe,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useLocale, t, type Locale } from '@/lib/i18n';
import { Logo } from '@/components/logo';

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
  item: {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  },
};

const FEATURES = [
  {
    icon: Compass,
    labelKey: 'landing.feat_itinerary',
    descKey: 'landing.feat_itinerary_desc',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Shield,
    labelKey: 'landing.feat_budget',
    descKey: 'landing.feat_budget_desc',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Sparkles,
    labelKey: 'landing.feat_ai',
    descKey: 'landing.feat_ai_desc',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
];

const BENEFITS = [
  {
    icon: Users,
    labelKey: 'landing.feat_collab',
    descKey: 'landing.feat_collab_desc',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: MapPin,
    labelKey: 'landing.feat_maps',
    descKey: 'landing.feat_maps_desc',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    icon: Shield,
    labelKey: 'landing.feat_security',
    descKey: 'landing.feat_security_desc',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    icon: StarIcon,
    labelKey: 'landing.feat_memories',
    descKey: 'landing.feat_memories_desc',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
  },
];

// Row 1 — portrait/tall images, scroll left
const MARQUEE_ROW1 = [
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=600&h=800',  // Santorini
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600&h=800',  // Kyoto
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600&h=800',  // Paris
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=800',  // Bali
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600&h=800',  // Dubai
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=600&h=800',  // Cinque Terre
];

// Row 2 — landscape images, scroll right
const MARQUEE_ROW2 = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=900&h=600',  // Mountain road
  'https://images.unsplash.com/photo-1640869429947-ace411d59d43?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',  // Beach
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=900&h=600',  // Patagonia aerial
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=900&h=600',  // Santorini blue domes
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=900&h=600',  // Coastal town
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=900&h=600',  // Infinity pool
];

export default function HomePage() {
  const [locale, setLocale] = useLocale();
  const flashlightRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showLocaleMenu, setShowLocaleMenu] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = flashlightRef.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo href="/" size="md" hideText={true} />

          {/* Right side — Language + Theme toggle + Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLocaleMenu(!showLocaleMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">{LOCALES.find(l => l.value === locale)?.label}</span>
              </button>
              {showLocaleMenu && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-max">
                  {LOCALES.map(l => (
                    <button
                      key={l.value}
                      onClick={() => {
                        setLocale(l.value);
                        setShowLocaleMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === l.value
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ThemeToggle />
            <Link href="/login">
              <button className="group bg-foreground text-background text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2 relative overflow-hidden">
                <span className="relative z-10 hidden sm:inline">{t(locale, 'landing.nav_login' as any)}</span>
                <span className="relative z-10 sm:hidden text-xs">{t(locale, 'landing.nav_login' as any)}</span>
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden pt-14 sm:pt-16">
        {/* Video background layer */}
        <div className="absolute inset-0 z-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
            <video
              key={isMobile ? 'mobile' : 'desktop'}
              autoPlay muted loop playsInline preload="auto"
              className="absolute inset-0 w-full h-full object-cover object-center"
              src={isMobile ? '/videos/hero-background-mobile.mp4' : '/videos/hero-background.mp4'}
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-64 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-6 py-4 sm:py-8">
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-7"
          >
            <motion.h1
              variants={stagger.item}
              className="text-[2.25rem] leading-[0.93] sm:text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight max-w-4xl mx-auto"
            >
              {t(locale, 'landing.hero_title_1' as any)}
              <br />
              <span className="text-gradient-accent">{t(locale, 'landing.hero_title_2' as any)}</span>
            </motion.h1>

            <motion.p
              variants={stagger.item}
              className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto font-light leading-relaxed"
            >
              {t(locale, 'landing.hero_desc' as any)}
            </motion.p>

            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                  <button className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                    <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-6 py-3.5 sm:px-8 sm:py-4 ring-1 ring-white/10">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                      <span className="relative z-10 text-sm sm:text-base font-medium tracking-wide text-white">{t(locale, 'landing.cta_start' as any)}</span>
                      <span className="relative z-10 ml-2.5 sm:ml-3 flex items-center text-indigo-300 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    </span>
                  </button>
                </div>
              </Link>

              <Link href="/dashboard/ai">
                <button className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm font-medium text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all hover:shadow-lg flex items-center gap-2 group backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  {t(locale, 'landing.cta_ai' as any)}
                  <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Search Widget */}
        <div className="relative z-10 pb-6 sm:pb-10 md:pb-20 px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/[0.08] border border-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-2">
              <div className="flex flex-col sm:flex-row gap-0 sm:gap-0 sm:items-stretch">
                {/* Destination */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-1 tracking-widest uppercase">{t(locale, 'landing.search_dest' as any)}</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="text-sm font-medium text-white truncate">{t(locale, 'landing.search_where' as any)}</span>
                    </div>
                  </div>
                </Link>

                <div className="mx-3.5 sm:mx-0 h-px sm:h-auto sm:w-px sm:my-2 bg-white/10 shrink-0" />

                {/* Date */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-1 tracking-widest uppercase">{t(locale, 'landing.search_when' as any)}</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="text-sm font-medium text-white/70 truncate">{t(locale, 'landing.search_dates' as any)}</span>
                    </div>
                  </div>
                </Link>

                <div className="mx-3.5 sm:mx-0 h-px sm:h-auto sm:w-px sm:my-2 bg-white/10 shrink-0" />

                {/* Travelers */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-1 tracking-widest uppercase">{t(locale, 'landing.search_travelers' as any)}</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="text-sm font-medium text-white truncate">{t(locale, 'landing.search_travelers_val' as any)}</span>
                    </div>
                  </div>
                </Link>

                {/* Search button */}
                <div className="pt-1 sm:pt-0 sm:pl-1.5 sm:shrink-0">
                  <Link href="/dashboard/trips/new" className="block">
                    <button className="w-full sm:w-auto h-full sm:min-h-[52px] px-5 py-3 sm:px-5 sm:py-0 bg-white text-zinc-900 rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                      <Search className="w-4 h-4" />
                      <span>{t(locale, 'landing.search_btn' as any)}</span>
                      <span className="absolute inset-0 overflow-hidden rounded-xl">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Destination Image Strip ── */}
      <section className="pb-6 sm:pb-10 md:pb-16 bg-background overflow-hidden">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

          {/* Row 1 — portrait images, scroll left */}
          <div className="flex overflow-hidden select-none sm:mb-4">
            <div className="flex gap-3 sm:gap-4 animate-marquee-fast flex-shrink-0 min-w-full items-end">
              {[...MARQUEE_ROW1, ...MARQUEE_ROW1].map((src, i) => (
                <div key={i} className="w-44 h-56 sm:w-64 sm:h-80 md:w-72 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-[1.02]">
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — landscape images, hidden on mobile */}
          <div className="hidden sm:flex overflow-hidden select-none">
            <div className="flex gap-4 animate-marquee-reverse flex-shrink-0 min-w-full items-start">
              {[...MARQUEE_ROW2, ...MARQUEE_ROW2].map((src, i) => (
                <div key={i} className="w-80 h-48 md:w-96 md:h-56 rounded-2xl overflow-hidden shrink-0 opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-[1.02]">
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Flashlight Cards) ── */}
      <section className="py-14 sm:py-20 md:py-32 bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
          <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full animate-spin-slow opacity-[0.02]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 180deg)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">01</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{t(locale, 'landing.features_title' as any)}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight mb-3 sm:mb-4">
              {t(locale, 'landing.features_desc' as any)}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 font-light max-w-lg">{t(locale, 'landing.features_sub' as any)}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.labelKey}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  ref={(el) => { flashlightRef.current[i] = el; }}
                  onMouseMove={(e) => handleMouseMove(e, i)}
                  className="flashlight-card relative rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6 md:p-8 flex flex-col group overflow-hidden hover:bg-white/[0.07] transition-colors"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${f.bgColor} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-white font-medium mb-1.5 sm:mb-2 text-base sm:text-lg tracking-tight">{t(locale, f.labelKey as any)}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">{t(locale, f.descKey as any)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-32 bg-background relative overflow-hidden section-glow">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[150px] animate-breathe" />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-4 sm:mb-6 shadow-sm">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">02</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t(locale, 'landing.why_title' as any)}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-3 sm:mb-4">
              {t(locale, 'landing.why_heading' as any)}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light max-w-lg">{t(locale, 'landing.why_sub' as any)}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.labelKey}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="bg-card rounded-2xl p-4 sm:p-5 md:p-7 border border-border shadow-card hover:shadow-card-lg hover:border-primary/10 transition-all group"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4 md:gap-5">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${b.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${b.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-foreground tracking-tight mb-1">{t(locale, b.labelKey as any)}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">{t(locale, b.descKey as any)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 sm:mb-14 md:mb-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">03</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{t(locale, 'landing.how_title' as any)}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight mb-3 sm:mb-4">
              {t(locale, 'landing.how_heading_1' as any)}{' '}
              <span className="text-gradient-accent">{t(locale, 'landing.how_heading_2' as any)}</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 font-light max-w-lg mx-auto">{t(locale, 'landing.how_sub' as any)}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-6 lg:gap-10 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-14 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px">
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/40 via-indigo-400/20 to-indigo-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/60" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/60" />
            </div>

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-5 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/15 group-hover:border-indigo-500/40 transition-all duration-300 group-hover:scale-105">
                  <MapPin className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-indigo-400" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-white text-[10px] sm:text-xs font-bold font-mono">01</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-lg sm:text-xl tracking-tight mb-2 sm:mb-3">{t(locale, 'landing.step1_title' as any)}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                {t(locale, 'landing.step1_desc' as any)}
              </p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 text-xs text-indigo-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
                <span>{t(locale, 'landing.step1_time' as any)}</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-5 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 group-hover:border-amber-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-400" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-amber-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-zinc-900 text-[10px] sm:text-xs font-bold font-mono">02</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-lg sm:text-xl tracking-tight mb-2 sm:mb-3">{t(locale, 'landing.step2_title' as any)}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                {t(locale, 'landing.step2_desc' as any)}
              </p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 text-xs text-amber-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                <span>{t(locale, 'landing.step2_time' as any)}</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-5 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                  <Compass className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-400" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-zinc-900 text-[10px] sm:text-xs font-bold font-mono">03</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-lg sm:text-xl tracking-tight mb-2 sm:mb-3">{t(locale, 'landing.step3_title' as any)}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                {t(locale, 'landing.step3_desc' as any)}
              </p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 text-xs text-emerald-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
                <span>{t(locale, 'landing.step3_time' as any)}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 sm:mt-14 md:mt-20 flex justify-center"
          >
            <Link href="/dashboard/ai">
              <button className="group inline-flex items-center gap-2.5 sm:gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-white text-sm font-medium px-6 py-3.5 sm:px-8 sm:py-4 rounded-full transition-all duration-300">
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <span>{t(locale, 'landing.how_cta' as any)}</span>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Destination Gallery ─────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-32 bg-background relative overflow-hidden section-glow">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[150px] animate-breathe" />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-4 sm:mb-6 shadow-sm">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">04</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t(locale, 'landing.dest_title' as any)}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-3 sm:mb-4">{t(locale, 'landing.dest_heading' as any)}</h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light max-w-lg">{t(locale, 'landing.dest_sub' as any)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 h-auto md:h-[550px]"
          >
            {/* Large Card */}
            <div className="col-span-2 md:row-span-2 h-52 sm:h-64 md:h-full group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Santorini" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1200" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6 md:p-8 flex flex-col justify-end">
                <span className="text-[10px] sm:text-xs font-medium text-white/80 mb-1 sm:mb-2 uppercase tracking-wider">Grécia</span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white tracking-tight">Santorini</h3>
                <div className="h-0 overflow-hidden group-hover:h-10 sm:group-hover:h-12 transition-all duration-300">
                  <p className="text-xs sm:text-sm text-white/90 mt-1.5 sm:mt-2 font-light">{t(locale, 'landing.dest_santorini_desc' as any)}</p>
                </div>
              </div>
            </div>
            {/* Small Card 1 */}
            <div className="h-36 sm:h-44 md:h-auto group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Kyoto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-3.5 sm:p-5 md:p-6 flex flex-col justify-end">
                <span className="text-[10px] sm:text-xs font-medium text-white/80 mb-0.5 sm:mb-1 uppercase tracking-wider">Japão</span>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-white tracking-tight">{t(locale, 'landing.dest_kyoto' as any)}</h3>
              </div>
            </div>
            {/* Small Card 2 */}
            <div className="h-36 sm:h-44 md:h-auto group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Cinque Terre" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-3.5 sm:p-5 md:p-6 flex flex-col justify-end">
                <span className="text-[10px] sm:text-xs font-medium text-white/80 mb-0.5 sm:mb-1 uppercase tracking-wider">Itália</span>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-white tracking-tight">Cinque Terre</h3>
              </div>
            </div>
            {/* Wide Card */}
            <div className="col-span-2 h-36 sm:h-44 md:h-auto group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Maldivas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1200" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-4 sm:p-6 md:p-8 flex flex-col justify-end">
                <span className="text-[10px] sm:text-xs font-medium text-white/80 mb-1 sm:mb-2 uppercase tracking-wider">Maldivas</span>
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-white tracking-tight">{t(locale, 'landing.dest_maldives_title' as any)}</h3>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA + Footer ─────────────────────────── */}
      <section className="relative bg-zinc-950 overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-[0.18]" />
          {/* Main glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[180px]" />
          {/* Side glows */}
          <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-indigo-600/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[120px]" />
          {/* Horizontal glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        </div>

        {/* ── CTA Content ── */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-32 md:pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 sm:space-y-6 md:space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white tracking-tight leading-[0.95]">
                {t(locale, 'landing.cta_heading_1' as any)}<br />
                <span className="text-gradient-accent">{t(locale, 'landing.cta_heading_2' as any)}</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-zinc-400 md:text-xl font-light max-w-xl mx-auto leading-relaxed">
                {t(locale, 'landing.cta_desc' as any)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-1 sm:pt-2">
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                  <button className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                    <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-6 py-3.5 sm:px-8 sm:py-4 ring-1 ring-white/10">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                      <span className="relative z-10 text-sm sm:text-base font-medium tracking-wide text-white">{t(locale, 'landing.cta_start' as any)}</span>
                      <span className="relative z-10 ml-2.5 sm:ml-3 flex items-center text-indigo-300 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    </span>
                  </button>
                </div>
              </Link>
              <Link href="/dashboard/ai">
                <button className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm font-medium text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  {t(locale, 'landing.cta_demo' as any)}
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* ── Footer ── */}
        <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 sm:pt-12 sm:pb-8 md:pt-16 md:pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12 md:mb-16">

            {/* Brand column */}
            <div className="col-span-2">
              {/* Logo */}
              <Logo href="/" size="md" hideText={true} className="mb-5" />
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs font-light">
                {t(locale, 'landing.footer_brand' as any)}
              </p>
            </div>

            {/* Produto */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">{t(locale, 'landing.footer_product' as any)}</h5>
              <ul className="space-y-3">
                {[
                  { labelKey: 'Dashboard', href: '/dashboard', isStatic: true },
                  { labelKey: 'landing.footer_plan_ai', href: '/dashboard/ai' },
                  { labelKey: 'landing.footer_my_trips', href: '/dashboard/trips' },
                  { labelKey: 'landing.footer_budget', href: '/dashboard/budget' },
                ].map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {l.isStatic ? l.labelKey : t(locale, l.labelKey as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">{t(locale, 'landing.footer_resources' as any)}</h5>
              <ul className="space-y-3">
                {[
                  { labelKey: 'landing.footer_favorites', href: '/dashboard/favorites' },
                  { labelKey: 'landing.footer_destinations', href: '/dashboard' },
                  { labelKey: 'landing.footer_settings', href: '/dashboard/settings' },
                ].map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {t(locale, l.labelKey as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">{t(locale, 'landing.footer_legal' as any)}</h5>
              <ul className="space-y-3">
                {[
                  { labelKey: 'landing.footer_privacy', href: '#' },
                  { labelKey: 'landing.footer_terms', href: '#' },
                  { labelKey: 'landing.footer_cookies', href: '#' },
                ].map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {t(locale, l.labelKey as any)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
            <p className="text-xs text-zinc-600 order-2 md:order-1">
              {t(locale, 'landing.footer_rights' as any).replace('{year}', String(new Date().getFullYear()))}
            </p>
            <div className="flex items-center gap-1.5 order-1 md:order-2">
              <span className="text-xs text-zinc-600">{t(locale, 'landing.footer_made' as any)}</span>
              <span className="text-xs text-indigo-500/70">✦</span>
              <span className="text-xs text-zinc-600">{t(locale, 'landing.footer_for' as any)}</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
