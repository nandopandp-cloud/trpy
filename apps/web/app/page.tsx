'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef, useCallback } from 'react';
import {
  ArrowRight, Sparkles, MapPin, Calendar, Users, Search,
  ChevronDown, Compass, Shield, Star as StarIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

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

const TRAVEL_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
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
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-[120px] animate-breathe" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/[0.03] rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]" />
          {/* Spinning gradient ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full animate-spin-slow opacity-[0.03]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 60deg, transparent 120deg)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={stagger.item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Planejador de viagens com IA</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={stagger.item}
              className="text-5xl md:text-7xl lg:text-[6.5rem] font-medium text-foreground tracking-tight leading-[0.92] max-w-5xl mx-auto"
            >
              Viaje com
              <br />
              <span className="text-gradient-accent">Propósito.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={stagger.item}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
            >
              Do itinerário ao orçamento, tudo em um só app. Deixe a IA fazer o trabalho pesado enquanto você sonha com o próximo destino.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary: Beam button */}
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-primary/20 opacity-0 rounded-full absolute blur-xl" />
                  <button className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                    <span className="relative flex h-full w-full items-center rounded-full bg-foreground px-8 py-4 ring-1 ring-background/10">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                      </span>
                      <span className="relative z-10 text-base font-medium tracking-wide text-background">Começar grátis</span>
                      <span className="relative z-10 ml-3 flex items-center text-primary transition duration-200 group-hover:translate-x-1 group-hover:text-background">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </span>
                  </button>
                </div>
              </Link>

              {/* Secondary */}
              <Link href="/dashboard/ai">
                <button className="px-8 py-4 rounded-full text-sm font-medium text-foreground border border-border bg-card hover:bg-muted hover:border-muted-foreground/20 transition-all hover:shadow-md flex items-center gap-2 group">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ver IA em ação
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={stagger.item} className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {['🧑‍🦱', '👩‍🦰', '🧔', '👩'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>+2k viagens planejadas</span>
            </motion.div>
          </motion.div>

          {/* Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto mt-14 bg-card p-2 rounded-3xl shadow-card-lg border border-border flex flex-col md:flex-row items-center gap-2 animate-pulse-glow"
          >
            <div className="flex-1 w-full px-4 py-3 hover:bg-muted rounded-2xl transition-colors cursor-pointer group">
              <label className="block text-xs font-medium text-muted-foreground mb-1 tracking-wide uppercase">Onde</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground" />
                <input
                  className="w-full bg-transparent border-none p-0 text-sm font-medium text-foreground placeholder-muted-foreground/50 focus:ring-0 outline-none"
                  placeholder="Buscar destinos..."
                  type="text"
                  readOnly
                />
              </div>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="flex-1 w-full px-4 py-3 hover:bg-muted rounded-2xl transition-colors cursor-pointer">
              <label className="block text-xs font-medium text-muted-foreground mb-1 tracking-wide uppercase">Quando</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-muted-foreground/60">Datas flexíveis</span>
              </div>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="flex-1 w-full px-4 py-3 hover:bg-muted rounded-2xl transition-colors cursor-pointer">
              <label className="block text-xs font-medium text-muted-foreground mb-1 tracking-wide uppercase">Quem</label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">2 Viajantes</span>
              </div>
            </div>
            <Link href="/dashboard/trips/new" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-foreground text-background p-4 rounded-2xl hover:opacity-90 transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                <Search className="w-5 h-5 mx-auto" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Image Marquee */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="mt-20 flex gap-4 overflow-hidden select-none opacity-60 fade-mask">
            <div className="flex gap-4 animate-marquee-fast whitespace-nowrap min-w-full justify-center">
              {[...TRAVEL_IMAGES, ...TRAVEL_IMAGES].map((src, i) => (
                <div key={i} className={`w-64 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden shrink-0 relative ${i % 2 === 1 ? 'mt-12' : ''}`}>
                  <img alt="Travel" className="object-cover w-full h-full" src={src} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Flashlight Cards) ────────────────── */}
      <section className="py-32 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
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
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
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
                  className="flashlight-card relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 flex flex-col group overflow-hidden hover:bg-white/[0.06] transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bgColor} flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-white font-medium mb-2">{f.label}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
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
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">02</span>
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

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-6xl animate-float inline-block">✈️</div>
            <h2 className="text-4xl md:text-6xl font-medium text-foreground tracking-tight leading-[1.05]">
              Comece sua jornada.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
              Grátis, elegante e com inteligência artificial. Planeje sua próxima aventura agora.
            </p>
            <Link href="/dashboard">
              <button className="bg-foreground text-background px-8 py-4 rounded-full text-sm font-medium hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-sm hover:shadow-md group relative overflow-hidden">
                <span className="relative z-10">Começar agora</span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </Link>
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
