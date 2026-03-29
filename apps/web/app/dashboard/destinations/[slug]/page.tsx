'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Plus, Compass, Youtube,
  Image as ImageIcon, Utensils, Hotel, Landmark, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlacesRecommendations } from '@/components/integrations/google/places-recommendations';
import { YouTubeGallery } from '@/components/integrations/youtube/youtube-gallery';
import { PinterestGallery } from '@/components/integrations/pinterest/pinterest-gallery';
import { GoogleMapView } from '@/components/integrations/google/google-map-view';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-emerald-700 via-teal-700 to-cyan-800',
  'from-violet-700 via-purple-700 to-indigo-800',
  'from-rose-700 via-pink-700 to-fuchsia-800',
  'from-amber-700 via-orange-600 to-red-700',
  'from-blue-700 via-indigo-700 to-violet-800',
];

const TABS = [
  { key: 'discover', label: 'Descobrir', icon: Compass },
  { key: 'videos', label: 'Vídeos', icon: Youtube },
  { key: 'photos', label: 'Fotos', icon: ImageIcon },
  { key: 'map', label: 'Mapa', icon: MapPin },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const destination = decodeURIComponent(params.slug).replace(/-/g, ' ');
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const gradient = GRADIENTS[destination.charCodeAt(0) % GRADIENTS.length];

  useEffect(() => {
    fetch(`/api/destination-photo?q=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.photoUrl) setCoverImage(data.data.photoUrl);
      })
      .catch(() => {});
  }, [destination]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={destination} className="w-full h-full object-cover" />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', gradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Destination info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/15 backdrop-blur-sm border-white/20 text-white/90 mb-2">
                Explorar destino
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight capitalize">
                {destination}
              </h1>
              <span className="flex items-center gap-1.5 text-white/75 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Descubra o melhor deste destino
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/trips/new')}
              className="shrink-0 flex items-center gap-1.5 bg-white text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Planejar viagem</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-4">
        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6 overflow-x-auto pb-1"
        >
          {[
            { icon: Utensils, label: 'Restaurantes', color: 'from-amber-500 to-orange-500' },
            { icon: Hotel, label: 'Hotéis', color: 'from-blue-500 to-indigo-500' },
            { icon: Landmark, label: 'Atrações', color: 'from-emerald-500 to-teal-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('discover')}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors shrink-0"
              >
                <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center', item.color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-foreground">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O que fazer em <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              <PlacesRecommendations destination={destination} />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vídeos sobre <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              <YouTubeGallery destination={destination} />
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Inspirações de <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              <PinterestGallery destination={destination} theme="travel" />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Mapa de <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              <GoogleMapView
                markers={[]}
                height="420px"
                defaultCenter={destination}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-16 md:bottom-6 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pointer-events-auto"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard/trips/new')}
            className="flex items-center gap-2.5 bg-ocean text-white font-bold px-6 py-3.5 rounded-full shadow-teal-lg glow-teal"
          >
            <Plus className="w-5 h-5" />
            Planejar viagem para {destination}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
