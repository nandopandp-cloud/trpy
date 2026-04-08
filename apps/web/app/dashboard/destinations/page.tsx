'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES = [
  { label: 'Praias', emoji: '🏖️', gradient: 'from-sky-400 to-cyan-500', desc: 'Mar, sol e areia branca' },
  { label: 'Montanhas', emoji: '⛰️', gradient: 'from-emerald-500 to-green-700', desc: 'Trilhas e altitudes' },
  { label: 'Cidades', emoji: '🏙️', gradient: 'from-violet-500 to-indigo-700', desc: 'Arte e arquitetura urbana' },
  { label: 'Aventura', emoji: '🪂', gradient: 'from-amber-400 to-orange-600', desc: 'Adrenalina pura' },
  { label: 'Gastronomia', emoji: '🍣', gradient: 'from-rose-500 to-red-600', desc: 'Culinária do mundo' },
  { label: 'Cultura', emoji: '🏛️', gradient: 'from-purple-500 to-violet-700', desc: 'História e tradição' },
  { label: 'Relax', emoji: '🧖', gradient: 'from-teal-400 to-cyan-600', desc: 'Spa e bem-estar' },
  { label: 'Família', emoji: '👨‍👩‍👧', gradient: 'from-pink-400 to-fuchsia-600', desc: 'Para toda a família' },
  { label: 'Natureza', emoji: '🌿', gradient: 'from-green-500 to-emerald-700', desc: 'Ecoturismo e fauna' },
  { label: 'Inverno', emoji: '❄️', gradient: 'from-blue-400 to-sky-600', desc: 'Neve e esqui' },
  { label: 'Cruzeiros', emoji: '🛳️', gradient: 'from-blue-600 to-indigo-700', desc: 'Viagens de navio' },
  { label: 'Safari', emoji: '🦁', gradient: 'from-yellow-500 to-amber-700', desc: 'África e vida selvagem' },
  { label: 'Festas', emoji: '🎉', gradient: 'from-fuchsia-500 to-pink-600', desc: 'Carnaval e festivais' },
  { label: 'Compras', emoji: '🛍️', gradient: 'from-orange-400 to-red-500', desc: 'Centros comerciais' },
  { label: 'Esportes', emoji: '🤿', gradient: 'from-cyan-500 to-blue-600', desc: 'Mergulho e surf' },
  { label: 'Lua de mel', emoji: '💑', gradient: 'from-rose-400 to-pink-600', desc: 'Destinos românticos' },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 } } },
};

export default function DestinationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = ALL_CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Explorar destinos</h1>
          <p className="text-xs text-muted-foreground">Escolha uma categoria para descobrir destinos</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {filtered.map(cat => (
          <motion.button
            key={cat.label}
            variants={stagger.item}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(cat.label.toLowerCase())}`)}
            className="group relative overflow-hidden rounded-2xl text-left cursor-pointer"
          >
            {/* Gradient bg */}
            <div className={cn('h-[120px] bg-gradient-to-br relative', cat.gradient)}>
              {/* Gloss */}
              <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/20 to-transparent" />
              {/* Dark fade bottom */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Large emoji bg */}
              <span className="absolute right-3 top-3 text-4xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-300 select-none">
                {cat.emoji}
              </span>
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-bold text-white leading-tight">{cat.label}</p>
                <p className="text-[10px] text-white/65 mt-0.5 leading-tight">{cat.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-sm">Nenhuma categoria encontrada para "{search}"</p>
        </motion.div>
      )}
    </div>
  );
}
