'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTrip, useUpdateTrip } from '@/hooks/useTrip';
import { TripForm, type TripFormValues } from '@/components/trips/trip-form';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { useLocale, t } from '@/lib/i18n';

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [locale] = useLocale();
  const { data: trip, isLoading } = useTrip(params.id);
  const updateTrip = useUpdateTrip(params.id);

  async function handleSubmit(values: TripFormValues) {
    await updateTrip.mutateAsync({
      ...values,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      budget: values.budget,
    } as any);
    toast.success(t(locale, 'edit_trip.success'));
    router.push(`/dashboard/trips/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t(locale, 'edit_trip.title')}</h1>
              <p className="text-sm text-muted-foreground">{trip?.title}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            {isLoading ? (
              <CardSkeleton />
            ) : trip ? (
              <TripForm
                defaultValues={{
                  title: trip.title,
                  destination: trip.destination,
                  startDate: format(new Date(trip.startDate), 'yyyy-MM-dd'),
                  endDate: format(new Date(trip.endDate), 'yyyy-MM-dd'),
                  budget: Number(trip.budget),
                  currency: trip.currency,
                  description: trip.description ?? undefined,
                }}
                onSubmit={handleSubmit}
                submitLabel={t(locale, 'edit_trip.save')}
              />
            ) : (
              <p className="text-muted-foreground text-sm">{t(locale, 'edit_trip.not_found')}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
