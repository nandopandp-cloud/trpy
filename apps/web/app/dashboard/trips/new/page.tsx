'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Wallet, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTrip } from '@/hooks/useTrips';
import { TripForm, type TripFormValues } from '@/components/trips/trip-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';

const INSPIRATIONS = [
  { emoji: '🗼', label: 'Paris', desc: '7 dias' },
  { emoji: '🌊', label: 'Bali', desc: '10 dias' },
  { emoji: '🏔️', label: 'Patagônia', desc: '14 dias' },
  { emoji: '🎌', label: 'Tóquio', desc: '10 dias' },
  { emoji: '🏝️', label: 'Maldivas', desc: '7 dias' },
  { emoji: '🌆', label: 'Nova York', desc: '5 dias' },
];

export default function NewTripPage() {
  const router = useRouter();
  const [locale] = useLocale();
  const createTrip = useCreateTrip();
  const [step, setStep] = useState<'inspire' | 'form'>('inspire');

  async function handleSubmit(values: TripFormValues) {
    try {
      await createTrip.mutateAsync({
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
      toast.success(t(locale, 'new_trip.success'), { description: `${values.title} — ${values.destination}` });
      router.push('/dashboard/trips');
    } catch (e) {
      toast.error((e as Error).message ?? t(locale, 'new_trip.error'));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 'form' ? setStep('inspire') : router.back()}
            className="rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black">
              {step === 'inspire' ? t(locale, 'new_trip.where') : t(locale, 'new_trip.details')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 'inspire' ? t(locale, 'new_trip.where_sub') : t(locale, 'new_trip.details_sub')}
            </p>
          </div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['inspire', 'form'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                step === s || (i === 0 && step === 'form')
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-muted text-muted-foreground'
              )}>
                {i === 0 && step === 'form' ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < 1 && (
                <div className={cn(
                  'h-0.5 w-8 rounded-full transition-all duration-500',
                  step === 'form' ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'inspire' && (
            <motion.div
              key="inspire"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Inspiration grid */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t(locale, 'new_trip.popular')}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {INSPIRATIONS.map((ins, i) => (
                    <motion.button
                      key={ins.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep('form')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{ins.emoji}</span>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">{ins.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ins.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{t(locale, 'common.or')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Create from scratch */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setStep('form')}
                className="w-full flex items-center justify-between gap-4 p-5 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-md group-hover:shadow-primary/20 transition-all">
                    <MapPin className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{t(locale, 'new_trip.scratch')}</p>
                    <p className="text-xs text-muted-foreground">{t(locale, 'new_trip.scratch_sub')}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>

              {/* AI suggestion */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push('/dashboard/ai')}
                className="w-full flex items-center justify-between gap-4 p-5 rounded-3xl border border-primary/20 bg-gradient-to-r from-emerald-500/6 to-teal-500/6 hover:from-emerald-500/12 hover:to-teal-500/12 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{t(locale, 'new_trip.ai')}</p>
                    <p className="text-xs text-muted-foreground">{t(locale, 'new_trip.ai_sub')}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <TripForm onSubmit={handleSubmit} submitLabel={t(locale, 'trips.create')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
