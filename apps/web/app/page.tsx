'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useCallback } from 'react';
import {
  ArrowRight, Sparkles, MapPin, Calendar, Users, Search,
  Compass, Shield, Star as StarIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

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
    label: 'Itinerário inteligente',
    desc: 'IA gera roteiros personalizados para o seu estilo de viagem.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Shield,
    label: 'Controle financeiro',
    desc: 'Acompanhe gastos por categoria com gráficos em tempo real.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Sparkles,
    label: 'IA generativa',
    desc: 'Descreva o destino dos sonhos e a IA planeja tudo para você.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
];

const BENEFITS = [
  {
    icon: Users,
    label: 'Planejamento colaborativo',
    desc: 'Convide amigos e família para planejar juntos. Todos editam o roteiro em tempo real.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: MapPin,
    label: 'Mapas interativos',
    desc: 'Visualize todos os pontos do seu roteiro no mapa. Calcule distâncias automaticamente.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    icon: Shield,
    label: 'Dados seguros',
    desc: 'Seus documentos e informações de viagem protegidos com criptografia de ponta a ponta.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    icon: StarIcon,
    label: 'Memórias organizadas',
    desc: 'Salve fotos, anotações e lembranças de cada viagem em um único lugar.',
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
  const flashlightRef = useRef<(HTMLDivElement | null)[]>([]);

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
          <Link href="/" className="flex items-center shrink-0 gap-2 group">
            {/* Icon: Stylized compass */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                {/* Outer circle */}
                <circle cx="12" cy="12" r="9.5" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />

                {/* Compass star - 4 points */}
                {/* Top */}
                <path d="M 12 3.5 L 13.2 8.5 L 12 12 Z" fill="#6366f1" />
                {/* Right */}
                <path d="M 20.5 12 L 15.5 13.2 L 12 12 Z" fill="#6366f1" />
                {/* Bottom */}
                <path d="M 12 20.5 L 10.8 15.5 L 12 12 Z" fill="#6366f1" />
                {/* Left */}
                <path d="M 3.5 12 L 8.5 10.8 L 12 12 Z" fill="#6366f1" />

                {/* Center dot */}
                <circle cx="12" cy="12" r="1.5" fill="#6366f1" />
              </svg>
            </div>

            {/* Text: TRPY */}
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">TRPY</span>
          </Link>

          {/* Right side — Theme toggle + Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <button className="group bg-foreground text-background text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2 relative overflow-hidden">
                <span className="relative z-10 hidden sm:inline">Entrar</span>
                <span className="relative z-10 sm:hidden text-xs">Entrar</span>
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
      <section className="relative min-h-screen flex flex-col overflow-hidden pt-14 sm:pt-16">
        {/* Video background layer */}
        <div className="absolute inset-0 z-0">
          {/* Fade-in wrapper for smooth video entry */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
            <video
              autoPlay muted loop playsInline preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/hero-background.mp4"
            />
          </motion.div>
          {/* Dark base overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Vignette — darkens edges for cinematic look */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
          {/* Bottom gradient — fades to page background */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
          {/* Top gradient — adds contrast behind navbar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-4 sm:py-8">

          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            {/* Heading */}
            <motion.h1
              variants={stagger.item}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-[0.93] max-w-4xl mx-auto"
            >
              Viaje com
              <br />
              <span className="text-gradient-accent">Propósito.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={stagger.item}
              className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto font-light leading-relaxed"
            >
              Do itinerário ao orçamento, tudo em um só app.
              <br className="hidden md:inline" /> Deixe a IA planejar enquanto você sonha com o próximo destino.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary: Beam button — unchanged */}
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                  <button className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                    <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-8 py-4 ring-1 ring-white/10">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                      <span className="relative z-10 text-base font-medium tracking-wide text-white">Começar grátis</span>
                      <span className="relative z-10 ml-3 flex items-center text-indigo-300 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </span>
                  </button>
                </div>
              </Link>

              {/* Secondary — glassmorphism dark */}
              <Link href="/dashboard/ai">
                <button className="px-8 py-4 rounded-full text-sm font-medium text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all hover:shadow-lg flex items-center gap-2 group backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  Ver IA em ação
                  <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </motion.div>

          </motion.div>
        </div>

        {/* Search Widget — glassmorphism dark, mobile-optimized */}
        <div className="relative z-10 pb-12 md:pb-20 px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/[0.08] border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-2">
              {/* Mobile: Vertical layout, Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-stretch">
                {/* Destination field */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-4 sm:py-3.5 hover:bg-white/10 rounded-2xl sm:rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-2 sm:mb-1 tracking-widest uppercase">Destino</p>
                    <div className="flex items-center gap-3 sm:gap-2">
                      <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-white/70 shrink-0" />
                      <span className="text-sm sm:text-sm font-medium text-white truncate">Para onde vamos?</span>
                    </div>
                  </div>
                </Link>

                {/* Divider — hidden on mobile */}
                <div className="hidden sm:block w-px my-2 bg-white/10 shrink-0" />

                {/* Date field */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-4 sm:py-3.5 hover:bg-white/10 rounded-2xl sm:rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-2 sm:mb-1 tracking-widest uppercase">Quando</p>
                    <div className="flex items-center gap-3 sm:gap-2">
                      <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-white/70 shrink-0" />
                      <span className="text-sm sm:text-sm font-medium text-white/70 truncate">Datas flexíveis</span>
                    </div>
                  </div>
                </Link>

                {/* Divider — hidden on mobile */}
                <div className="hidden sm:block w-px my-2 bg-white/10 shrink-0" />

                {/* Travelers field */}
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-4 sm:py-3.5 hover:bg-white/10 rounded-2xl sm:rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-white/50 mb-2 sm:mb-1 tracking-widest uppercase">Viajantes</p>
                    <div className="flex items-center gap-3 sm:gap-2">
                      <Users className="w-5 h-5 sm:w-4 sm:h-4 text-white/70 shrink-0" />
                      <span className="text-sm sm:text-sm font-medium text-white truncate">2 pessoas</span>
                    </div>
                  </div>
                </Link>

                {/* Search button — full-width on mobile, auto on desktop */}
                <div className="sm:pl-1.5 sm:shrink-0">
                  <Link href="/dashboard/trips/new" className="block">
                    <button className="w-full sm:w-auto h-full sm:min-h-[52px] px-6 sm:px-5 py-4 sm:py-0 bg-white text-zinc-900 rounded-2xl sm:rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition-all hover:scale-[1.02] sm:hover:scale-100 flex items-center justify-center gap-2 group relative overflow-hidden">
                      <Search className="w-5 sm:w-4 h-5 sm:h-4" />
                      <span>Buscar</span>
                      <span className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-xl">
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
      <section className="pb-16 bg-background overflow-hidden space-y-4">
        {/* Side fade masks shared across both rows */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

          {/* Row 1 — portrait images, scroll left */}
          <div className="flex overflow-hidden select-none mb-4">
            <div className="flex gap-4 animate-marquee-fast flex-shrink-0 min-w-full items-end">
              {[...MARQUEE_ROW1, ...MARQUEE_ROW1].map((src, i) => (
                <div key={i} className="w-64 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden shrink-0 opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-[1.02]">
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — landscape images, scroll right */}
          <div className="flex overflow-hidden select-none">
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

      {/* ── Features (Flashlight Cards) — explicit zinc-900 so it stays dark in both light+dark mode ── */}
      <section className="py-32 bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full animate-spin-slow opacity-[0.02]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 180deg)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">01</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">Funcionalidades</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
              Tudo que você precisa,{' '}
              <span className="text-gradient-accent">num só lugar.</span>
            </h2>
            <p className="text-zinc-500 font-light max-w-lg">Ferramentas interativas com animações, efeitos e transições para a melhor experiência de planejamento.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  ref={(el) => { flashlightRef.current[i] = el; }}
                  onMouseMove={(e) => handleMouseMove(e, i)}
                  className="flashlight-card relative rounded-2xl border border-white/8 bg-white/[0.03] p-8 flex flex-col group overflow-hidden hover:bg-white/[0.07] transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-white font-medium mb-2 text-lg tracking-tight">{f.label}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────── */}
      <section className="py-32 bg-background relative overflow-hidden section-glow">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[150px] animate-breathe" />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-6 shadow-sm">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">02</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Por que o TRPY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-4">
              Tudo que você precisa,{' '}
              <span className="text-gradient-accent">num só lugar.</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-lg">Do planejamento à memória, cada etapa da sua jornada coberta.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-card-lg hover:border-primary/10 transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl ${b.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${b.color}`} />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-foreground tracking-tight mb-1.5">{b.label}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light">{b.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">03</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">Como funciona</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
              Do sonho à{' '}
              <span className="text-gradient-accent">realidade.</span>
            </h2>
            <p className="text-zinc-500 font-light max-w-lg mx-auto">Três passos simples para transformar sua ideia de viagem em um roteiro completo e organizado.</p>
          </motion.div>

          {/* Steps grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-14 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px">
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/40 via-indigo-400/20 to-indigo-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/60" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/60" />
            </div>

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="w-28 h-28 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/15 group-hover:border-indigo-500/40 transition-all duration-300 group-hover:scale-105">
                  <MapPin className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-indigo-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold font-mono">01</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-xl tracking-tight mb-3">Escolha o destino</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                Informe para onde quer ir, as datas e quantas pessoas. Deixe a sua imaginação guiar.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-indigo-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
                <span>30 segundos</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="w-28 h-28 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 group-hover:border-amber-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-amber-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-zinc-900 text-xs font-bold font-mono">02</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-xl tracking-tight mb-3">A IA planeja tudo</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                Nossa IA gera um itinerário completo: atividades, restaurantes, hospedagem e orçamento.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-amber-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                <span>Menos de 2 minutos</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="w-28 h-28 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                  <Compass className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                  <span className="text-zinc-900 text-xs font-bold font-mono">03</span>
                </div>
              </div>
              <h3 className="text-white font-medium text-xl tracking-tight mb-3">Viaje sem preocupações</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xs">
                Acesse seu roteiro offline, acompanhe os gastos e guarde memórias da sua aventura.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-emerald-400/70 font-medium">
                <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
                <span>Disponível no celular</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-20 flex justify-center"
          >
            <Link href="/dashboard/ai">
              <button className="group inline-flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-white text-sm font-medium px-8 py-4 rounded-full transition-all duration-300">
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <span>Ver IA gerando um roteiro</span>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Destination Gallery ─────────────────────────── */}
      <section className="py-32 bg-background relative overflow-hidden section-glow">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[150px] animate-breathe" />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-6 shadow-sm">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">04</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Destinos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-4">Descubra o mundo.</h2>
            <p className="text-muted-foreground font-light max-w-lg">Destinos curados com fotos reais e experiências únicas.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[550px]"
          >
            {/* Large Card */}
            <div className="md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Santorini" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1200" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <span className="text-xs font-medium text-white/80 mb-2 uppercase tracking-wider">Grécia</span>
                <h3 className="text-2xl font-medium text-white tracking-tight">Santorini</h3>
                <div className="h-0 overflow-hidden group-hover:h-12 transition-all duration-300">
                  <p className="text-sm text-white/90 mt-2 font-light">Vilas privadas com vista para a caldeira.</p>
                </div>
              </div>
            </div>
            {/* Small Card 1 */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Kyoto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-6 flex flex-col justify-end">
                <span className="text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">Japão</span>
                <h3 className="text-lg font-medium text-white tracking-tight">Outono em Kyoto</h3>
              </div>
            </div>
            {/* Small Card 2 */}
            <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Cinque Terre" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-6 flex flex-col justify-end">
                <span className="text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">Itália</span>
                <h3 className="text-lg font-medium text-white tracking-tight">Cinque Terre</h3>
              </div>
            </div>
            {/* Wide Card */}
            <div className="md:col-span-2 group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img alt="Maldivas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1200" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-8 flex flex-col justify-end">
                <span className="text-xs font-medium text-white/80 mb-2 uppercase tracking-wider">Maldivas</span>
                <h3 className="text-xl font-medium text-white tracking-tight">Paraíso no Oceano</h3>
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
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
              </span>
              <span className="text-xs font-medium text-zinc-400 tracking-wide">Comece gratuitamente hoje</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-medium text-white tracking-tight leading-[0.95]">
                Sua próxima viagem<br />
                <span className="text-gradient-accent">começa aqui.</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
                Planeie, organize e viva cada aventura com mais intenção. Grátis para sempre.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                  <button className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                    <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-8 py-4 ring-1 ring-white/10">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                      <span className="relative z-10 text-base font-medium tracking-wide text-white">Começar grátis</span>
                      <span className="relative z-10 ml-3 flex items-center text-indigo-300 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </span>
                  </button>
                </div>
              </Link>
              <Link href="/dashboard/ai">
                <button className="px-8 py-4 rounded-full text-sm font-medium text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Ver demo da IA
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">
              {['Sem cartão de crédito', 'Cancele quando quiser', 'Dados protegidos'].map((item, i) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-indigo-500/70" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* ── Footer ── */}
        <footer className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">

            {/* Brand column */}
            <div className="col-span-2">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2 mb-5 group">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <circle cx="12" cy="12" r="9.5" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
                    <path d="M 12 3.5 L 13.2 8.5 L 12 12 Z" fill="#6366f1" />
                    <path d="M 20.5 12 L 15.5 13.2 L 12 12 Z" fill="#6366f1" />
                    <path d="M 12 20.5 L 10.8 15.5 L 12 12 Z" fill="#6366f1" />
                    <path d="M 3.5 12 L 8.5 10.8 L 12 12 Z" fill="#6366f1" />
                    <circle cx="12" cy="12" r="1.5" fill="#6366f1" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">TRPY</span>
              </Link>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs font-light">
                O super-app de viagens que combina planejamento inteligente, IA generativa e controle financeiro em um só lugar.
              </p>
              {/* Status */}
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/8">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-xs text-zinc-500">Todos os sistemas operacionais</span>
              </div>
            </div>

            {/* Produto */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Produto</h5>
              <ul className="space-y-3">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Planejar com IA', href: '/dashboard/ai' },
                  { label: 'Minhas viagens', href: '/dashboard/trips' },
                  { label: 'Orçamento', href: '/dashboard/budget' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Recursos</h5>
              <ul className="space-y-3">
                {[
                  { label: 'Favoritos', href: '/dashboard/favorites' },
                  { label: 'Destinos', href: '/dashboard' },
                  { label: 'Configurações', href: '/dashboard/settings' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Legal</h5>
              <ul className="space-y-3">
                {[
                  { label: 'Privacidade', href: '#' },
                  { label: 'Termos de uso', href: '#' },
                  { label: 'Cookies', href: '#' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
            <p className="text-xs text-zinc-600 order-2 md:order-1">
              © {new Date().getFullYear()} TRPY. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1.5 order-1 md:order-2">
              <span className="text-xs text-zinc-600">Feito com</span>
              <span className="text-xs text-indigo-500/70">✦</span>
              <span className="text-xs text-zinc-600">para viajantes do mundo todo</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
