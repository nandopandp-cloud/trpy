'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Wallet, Sparkles } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { useCreateTrip } from '@/hooks/useTrips';
import { TripForm, type TripFormValues } from '@/components/trips/trip-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';
import { getRandomDestinations, type DestinationTemplate } from '@/lib/destination-templates';

export default function NewTripPage({
  searchParams,
}: {
  searchParams?: { destination?: string };
}) {
  const router = useRouter();
  const [locale] = useLocale();
  const createTrip = useCreateTrip();

  // If ?destination= is provided, skip step 1 and go straight to the form
  const prefillDestination = searchParams?.destination
    ? decodeURIComponent(searchParams.destination)
    : null;

  const [step, setStep] = useState<'inspire' | 'form'>(prefillDestination ? 'form' : 'inspire');
  const [selectedTemplate, setSelectedTemplate] = useState<DestinationTemplate | null>(null);

  // Get random 6 destinations on mount
  const inspirations = useMemo(() => getRandomDestinations(6), []);

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

  function handleSelectDestination(template: DestinationTemplate) {
    const tomorrow = addDays(new Date(), 1);
    const endDate = addDays(tomorrow, template.durationDays);

    setSelectedTemplate({
      ...template,
    });
    setStep('form');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
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
                  {inspirations.map((template, i) => (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectDestination(template)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{template.emoji}</span>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">{template.label}</p>
                        <p className="text-[10px] text-muted-foreground">{template.durationDays} dias</p>
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
                {selectedTemplate && (
                  <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                    <span className="text-3xl">{selectedTemplate.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{selectedTemplate.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedTemplate.description}</p>
                    </div>
                  </div>
                )}
                {!selectedTemplate && prefillDestination && (
                  <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm capitalize">{prefillDestination}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Destino pré-selecionado</p>
                    </div>
                  </div>
                )}
                <TripForm
                  defaultValues={selectedTemplate ? {
                    destination: selectedTemplate.label,
                    title: selectedTemplate.suggestedTitle,
                    description: selectedTemplate.description,
                    budget: selectedTemplate.suggestedBudget,
                    currency: selectedTemplate.currency,
                    startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                    endDate: format(addDays(new Date(), 1 + selectedTemplate.durationDays), 'yyyy-MM-dd'),
                  } : prefillDestination ? {
                    destination: prefillDestination,
                    title: `Viagem para ${prefillDestination}`,
                    currency: 'BRL',
                  } : {
                    currency: 'BRL',
                  }}
                  onSubmit={handleSubmit}
                  submitLabel={t(locale, 'trips.create')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
