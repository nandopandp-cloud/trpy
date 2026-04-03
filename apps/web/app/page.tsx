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
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3c?auto=format&fit=crop&q=80&w=900&h=600',  // Beach
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-foreground font-semibold tracking-tighter text-lg uppercase flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform duration-300" />
            <span className="group-hover:tracking-normal transition-all duration-300">TRPY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Funcionalidades', 'Destinos', 'Sobre'].map((item) => (
              <span
                key={item}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full"
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <button className="group bg-foreground text-background text-xs md:text-sm font-medium px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2 relative overflow-hidden">
                <span className="relative z-10">Entrar</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-500/[0.07] dark:bg-indigo-500/[0.04] rounded-full blur-[130px] animate-breathe" />
          <div className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.04] dark:bg-purple-500/[0.03] rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-[0.25]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_0%,hsl(var(--background))_80%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-spin-slow opacity-[0.025]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 60deg, transparent 120deg)' }} />
        </div>

        {/* Floating destination cards — only on very wide screens */}
        <div className="hidden xl:block absolute left-6 2xl:left-16 top-1/2 -translate-y-1/2 pointer-events-none z-0 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -8 }}
            animate={{ opacity: 0.55, x: 0, rotate: -8 }}
            transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-44 h-60 rounded-2xl overflow-hidden shadow-2xl animate-float-slow"
            style={{ transformOrigin: 'center' }}
          >
            <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=400&h=550" alt="" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -4 }}
            animate={{ opacity: 0.35, x: 0, rotate: -4 }}
            transition={{ delay: 1.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-36 h-48 rounded-2xl overflow-hidden shadow-xl ml-10 animate-float"
          >
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3c?auto=format&fit=crop&q=80&w=350&h=480" alt="" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="hidden xl:block absolute right-6 2xl:right-16 top-1/2 -translate-y-1/2 pointer-events-none z-0 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 8 }}
            animate={{ opacity: 0.55, x: 0, rotate: 8 }}
            transition={{ delay: 1.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-44 h-60 rounded-2xl overflow-hidden shadow-2xl animate-float"
            style={{ transformOrigin: 'center' }}
          >
            <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400&h=550" alt="" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 5 }}
            animate={{ opacity: 0.35, x: 0, rotate: 5 }}
            transition={{ delay: 1.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-36 h-48 rounded-2xl overflow-hidden shadow-xl mr-10 animate-float-slow"
          >
            <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=350&h=480" alt="" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            {/* Heading */}
            <motion.h1
              variants={stagger.item}
              className="text-5xl md:text-7xl lg:text-8xl font-medium text-foreground tracking-tight leading-[0.93] max-w-4xl mx-auto"
            >
              Viaje com
              <br />
              <span className="text-gradient-accent">Propósito.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={stagger.item}
              className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed"
            >
              Do itinerário ao orçamento, tudo em um só app.
              <br className="hidden md:inline" /> Deixe a IA planejar enquanto você sonha com o próximo destino.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary: Beam button — uses explicit zinc-900 so it stays dark in both themes */}
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

              {/* Secondary */}
              <Link href="/dashboard/ai">
                <button className="px-8 py-4 rounded-full text-sm font-medium text-foreground border border-border bg-card/80 hover:bg-muted hover:border-muted-foreground/30 transition-all hover:shadow-md flex items-center gap-2 group backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ver IA em ação
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={stagger.item} className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex -space-x-2">
                {['🧑‍🦱', '👩‍🦰', '🧔', '👩'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>+2k viagens planejadas</span>
            </motion.div>
          </motion.div>

          {/* Search Widget — redesigned, all columns link to dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto mt-12"
          >
            <div className="bg-card border border-border rounded-2xl shadow-card-lg p-1.5">
              <div className="flex flex-col sm:flex-row items-stretch">
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-3.5 hover:bg-muted rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1 tracking-widest uppercase">Destino</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">Para onde vamos?</span>
                    </div>
                  </div>
                </Link>
                <div className="hidden sm:block w-px my-2 bg-border shrink-0" />
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-3.5 hover:bg-muted rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1 tracking-widest uppercase">Quando</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-muted-foreground/70 truncate">Datas flexíveis</span>
                    </div>
                  </div>
                </Link>
                <div className="hidden sm:block w-px my-2 bg-border shrink-0" />
                <Link href="/dashboard/trips/new" className="flex-1 min-w-0">
                  <div className="px-4 py-3.5 hover:bg-muted rounded-xl transition-colors cursor-pointer">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1 tracking-widest uppercase">Viajantes</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">2 pessoas</span>
                    </div>
                  </div>
                </Link>
                <div className="pt-1.5 sm:pt-0 sm:pl-1.5 shrink-0">
                  <Link href="/dashboard/trips/new">
                    <button className="w-full sm:w-auto h-full min-h-[52px] px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium text-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden">
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">Buscar</span>
                      <span className="absolute inset-0 overflow-hidden rounded-xl">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
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

      {/* ── Product Preview ─────────────────────────────── */}
      <section className="py-12 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-3xl p-2 shadow-card-lg animate-pulse-glow"
          >
            <div className="bg-muted rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
              <div className="relative z-10">
                {/* Fake dashboard preview */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="bg-card/70 backdrop-blur-xl border-b border-border px-6 h-12 flex items-center justify-between">
                    <span className="text-foreground font-semibold tracking-tighter text-xs uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />TRPY
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-sm font-medium text-foreground">Minhas Viagens</h4>
                      <button className="bg-foreground text-background text-[10px] px-3 py-1.5 rounded-full">+ Nova</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400', name: 'Tokyo', date: 'Mai 2025' },
                        { src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400', name: 'Paris', date: 'Jul 2025' },
                        { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400', name: 'Bali', date: 'Set 2024' },
                      ].map((item) => (
                        <div key={item.name} className="rounded-xl overflow-hidden border border-border group cursor-pointer hover:shadow-md transition-all">
                          <div className="h-20 overflow-hidden">
                            <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.src} />
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-medium text-foreground">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">03</span>
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

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[150px] animate-breathe" />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl border border-border shadow-card-xl overflow-hidden relative"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/[0.06] rounded-full blur-[100px] animate-breathe" />
              <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
            </div>
            <div className="relative z-10 px-8 py-20 text-center">
              <div className="text-6xl animate-float inline-block mb-8">✈️</div>
              <h2 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight leading-[1.05] mb-5">
                Comece sua próxima aventura.
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light mb-10">
                Crie sua conta gratuita e comece a planejar viagens incríveis hoje mesmo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <div className="relative w-full">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="w-full bg-muted border border-border text-foreground text-sm rounded-full pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Seu melhor email"
                    type="email"
                  />
                </div>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap shadow-sm hover:shadow-md group relative overflow-hidden">
                    <span className="relative z-10">Começar grátis</span>
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-background border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2 md:col-span-1">
              <span className="text-foreground font-semibold tracking-tighter text-base uppercase flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary" />TRPY
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Um super-app de viagens combinando estética elegante com IA e gestão financeira.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Produto</h4>
              <ul className="space-y-3">
                <li><Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard">Dashboard</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard/ai">IA</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard/trips">Viagens</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Recursos</h4>
              <ul className="space-y-3">
                <li><Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard/budget">Finanças</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/dashboard/favorites">Favoritos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">TRPY — Design System v2.0</p>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Todos os sistemas operacionais
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
