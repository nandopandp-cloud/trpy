'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';
import { cn } from '@/lib/utils';
import { useLocale, t, type Locale } from '@/lib/i18n';

const ALL_CATEGORIES = [
  { labelKey: 'dest_cat.beaches', emoji: '🏖️', gradient: 'from-sky-400 to-cyan-500', descKey: 'dest_cat.beaches_desc', query: 'tropical beach ocean waves' },
  { labelKey: 'dest_cat.mountains', emoji: '⛰️', gradient: 'from-emerald-500 to-green-700', descKey: 'dest_cat.mountains_desc', query: 'mountain peaks landscape snow' },
  { labelKey: 'dest_cat.cities', emoji: '🏙️', gradient: 'from-violet-500 to-indigo-700', descKey: 'dest_cat.cities_desc', query: 'city architecture skyline urban' },
  { labelKey: 'dest_cat.adventure', emoji: '🪂', gradient: 'from-amber-400 to-orange-600', descKey: 'dest_cat.adventure_desc', query: 'extreme adventure sports nature' },
  { labelKey: 'dest_cat.gastronomy', emoji: '🍣', gradient: 'from-rose-500 to-red-600', descKey: 'dest_cat.gastronomy_desc', query: 'gourmet food cuisine restaurant' },
  { labelKey: 'dest_cat.culture', emoji: '🏛️', gradient: 'from-purple-500 to-violet-700', descKey: 'dest_cat.culture_desc', query: 'historical temple ruins architecture' },
  { labelKey: 'dest_cat.relax', emoji: '🧖', gradient: 'from-teal-400 to-cyan-600', descKey: 'dest_cat.relax_desc', query: 'spa pool resort infinity wellness' },
  { labelKey: 'dest_cat.family', emoji: '👨‍👩‍👧', gradient: 'from-pink-400 to-fuchsia-600', descKey: 'dest_cat.family_desc', query: 'family vacation kids park fun' },
  { labelKey: 'dest_cat.nature', emoji: '🌿', gradient: 'from-green-500 to-emerald-700', descKey: 'dest_cat.nature_desc', query: 'rainforest wildlife nature jungle' },
  { labelKey: 'dest_cat.winter', emoji: '❄️', gradient: 'from-blue-400 to-sky-600', descKey: 'dest_cat.winter_desc', query: 'snow winter ski mountain landscape' },
  { labelKey: 'dest_cat.cruises', emoji: '🛳️', gradient: 'from-blue-600 to-indigo-700', descKey: 'dest_cat.cruises_desc', query: 'cruise ship ocean sea travel' },
  { labelKey: 'dest_cat.safari', emoji: '🦁', gradient: 'from-yellow-500 to-amber-700', descKey: 'dest_cat.safari_desc', query: 'safari africa wildlife savanna lion' },
  { labelKey: 'dest_cat.parties', emoji: '🎉', gradient: 'from-fuchsia-500 to-pink-600', descKey: 'dest_cat.parties_desc', query: 'festival carnival celebration fireworks' },
  { labelKey: 'dest_cat.shopping', emoji: '🛍️', gradient: 'from-orange-400 to-red-500', descKey: 'dest_cat.shopping_desc', query: 'shopping mall market street fashion' },
  { labelKey: 'dest_cat.sports', emoji: '🤿', gradient: 'from-cyan-500 to-blue-600', descKey: 'dest_cat.sports_desc', query: 'surf diving underwater ocean sport' },
  { labelKey: 'dest_cat.honeymoon', emoji: '💑', gradient: 'from-rose-400 to-pink-600', descKey: 'dest_cat.honeymoon_desc', query: 'romantic sunset couple beach travel' },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 } } },
};

// ─── Each card manages its own photo hook ────────────────────────────────────

interface CatItem {
  labelKey: string;
  emoji: string;
  gradient: string;
  descKey: string;
  query: string;
}

function CategoryCard({ cat, locale }: { cat: CatItem; locale: Locale }) {
  const router = useRouter();
  const photo = useDestinationPhoto(cat.query);

  return (
    <motion.button
      variants={stagger.item}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(t(locale, cat.labelKey as any).toLowerCase())}`)}
      className="group relative overflow-hidden rounded-2xl text-left cursor-pointer"
    >
      <div className={cn('h-[120px] relative overflow-hidden', !photo && `bg-gradient-to-br ${cat.gradient}`)}>
        {/* Real photo */}
        {photo && (
          <img
            src={photo}
            alt={t(locale, cat.labelKey as any)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {/* Overlays — only when there's a photo */}
        {photo && (
          <>
            <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 to-transparent" />
          </>
        )}
        {/* Text — only when there's a photo (no emoji, cleaner look) */}
        {photo && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-sm font-bold text-white leading-tight">{t(locale, cat.labelKey as any)}</p>
            <p className="text-[10px] text-white/65 mt-0.5 leading-tight">{t(locale, cat.descKey as any)}</p>
          </div>
        )}
        {/* Fallback when no photo: emoji + text */}
        {!photo && (
          <>
            <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute right-3 top-3 text-3xl opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300 select-none drop-shadow">
              {cat.emoji}
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-bold text-white leading-tight">{t(locale, cat.labelKey as any)}</p>
              <p className="text-[10px] text-white/65 mt-0.5 leading-tight">{t(locale, cat.descKey as any)}</p>
            </div>
          </>
        )}
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DestinationsPage() {
  const router = useRouter();
  const [locale] = useLocale();
  const [search, setSearch] = useState('');

  const filtered = ALL_CATEGORIES.filter(c =>
    t(locale, c.labelKey as any).toLowerCase().includes(search.toLowerCase()) ||
    t(locale, c.descKey as any).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
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
          <h1 className="text-lg font-bold text-foreground leading-tight">{t(locale, 'destinations.title' as any)}</h1>
          <p className="text-xs text-muted-foreground">{t(locale, 'destinations.subtitle' as any)}</p>
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
          placeholder={t(locale, 'destinations.search' as any)}
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
          <CategoryCard key={cat.labelKey} cat={cat} locale={locale} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-sm">{t(locale, 'destinations.no_results' as any).replace('{search}', search)}</p>
        </motion.div>
      )}
    </div>
  );
}
