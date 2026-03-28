'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Map, Wallet, Calendar, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
  item: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  },
};

const FEATURES = [
  {
    icon: Map, label: 'Itinerário visual',
    desc: 'Monte seus dias com drag-and-drop e mapa integrado.',
    gradient: 'from-emerald-500 to-teal-600', glow: 'glow-teal',
  },
  {
    icon: Wallet, label: 'Controle financeiro',
    desc: 'Acompanhe gastos por categoria com gráficos em tempo real.',
    gradient: 'from-sky-500 to-blue-600', glow: 'glow-blue',
  },
  {
    icon: Sparkles, label: 'IA generativa',
    desc: 'Descreva seu destino e a IA cria um itinerário personalizado.',
    gradient: 'from-amber-400 to-orange-500', glow: 'glow-amber',
  },
  {
    icon: Calendar, label: 'Planejamento fácil',
    desc: 'Datas, orçamento, notas e companheiros — tudo em um só lugar.',
    gradient: 'from-violet-500 to-purple-600', glow: 'glow-violet',
  },
];

const FLOATING_CARDS = [
  { emoji: '🗼', place: 'Paris', days: '7 dias', gradient: 'from-sky-600 to-indigo-700', delay: 0, rotate: '-3deg' },
  { emoji: '🌊', place: 'Bali', days: '10 dias', gradient: 'from-emerald-600 to-teal-700', delay: 0.5, rotate: '0deg' },
  { emoji: '🏔️', place: 'Patagônia', days: '14 dias', gradient: 'from-rose-600 to-pink-700', delay: 1, rotate: '3deg' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between glass-card border-b">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-7 h-7 rounded-lg bg-ocean flex items-center justify-center glow-teal"
          >
            <Map className="w-3.5 h-3.5 text-white" />
          </motion.div>
          <span className="font-black text-gradient-ocean text-lg tracking-tight">Trpy</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 bg-ocean hover:opacity-90 border-0 glow-teal">
              Entrar <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-24 left-1/4 w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-teal-500/8 blur-3xl animate-float-slow pointer-events-none" />

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="relative max-w-3xl mx-auto space-y-6"
        >
          {/* Badge */}
          <motion.div
            variants={stagger.item}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Planejador de viagens com IA
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={stagger.item} className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            Viaje mais,
            <br />
            <span className="text-gradient-ocean">planeje melhor.</span>
          </motion.h1>

          <motion.p variants={stagger.item} className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Do itinerário ao orçamento, tudo em um só app. Deixe a IA fazer o trabalho pesado enquanto você sonha com o próximo destino.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8 bg-ocean hover:opacity-90 border-0 glow-teal animate-pulse-glow w-full sm:w-auto">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/ai">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 w-full sm:w-auto">
                <Sparkles className="w-4 h-4 text-primary" /> Ver IA em ação
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={stagger.item} className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {['🧑‍🦱', '👩‍🦰', '🧔', '👩'].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-ocean border-2 border-background flex items-center justify-center text-xs">
                  {e}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>+2k viagens planejadas</span>
          </motion.div>
        </motion.div>

        {/* Floating cards */}
        <div className="relative mt-16 w-full max-w-3xl mx-auto h-48 hidden md:block">
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={card.place}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + card.delay, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute glass-card rounded-3xl p-3 w-36 border-gradient shadow-card-lg
                ${i === 0 ? 'left-4 top-0' : ''}
                ${i === 1 ? 'left-1/2 -translate-x-1/2 -top-4' : ''}
                ${i === 2 ? 'right-4 top-0' : ''}
              `}
              style={{
                rotate: card.rotate,
                animation: `float ${6 + i * 2}s ease-in-out infinite ${card.delay}s`,
              }}
            >
              <div className={`w-full h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-end p-2 mb-2`}>
                <span className="text-2xl">{card.emoji}</span>
              </div>
              <p className="font-bold text-foreground text-xs">{card.place}</p>
              <p className="text-[11px] text-muted-foreground">{card.days}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl md:text-5xl font-black">
              Tudo que você precisa,{' '}
              <span className="text-gradient-ocean">num só lugar.</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  variants={stagger.item}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative group rounded-3xl border border-border bg-card p-7 overflow-hidden"
                >
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-8 transition-all duration-500 blur-2xl`} />
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 ${f.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{f.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-2xl mx-auto text-center overflow-hidden rounded-3xl border border-primary/20 p-14"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-teal-500/6 to-cyan-500/8" />
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />

          <div className="relative space-y-5">
            <div className="text-5xl animate-float inline-block">🌍</div>
            <h2 className="text-4xl font-black leading-tight">
              Pronta para sua{' '}
              <span className="text-gradient-ocean">próxima aventura?</span>
            </h2>
            <p className="text-muted-foreground">Grátis, bonito e fácil de usar.</p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base px-10 bg-ocean hover:opacity-90 border-0 glow-teal mt-2">
                Começar agora <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
