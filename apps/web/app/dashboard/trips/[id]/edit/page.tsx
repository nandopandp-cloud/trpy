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

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: trip, isLoading } = useTrip(params.id);
  const updateTrip = useUpdateTrip(params.id);

  async function handleSubmit(values: TripFormValues) {
    await updateTrip.mutateAsync({
      ...values,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      budget: values.budget,
    } as any);
    toast.success('Viagem atualizada!');
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
              <h1 className="text-2xl font-bold">Editar viagem</h1>
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
                submitLabel="Salvar alterações"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Viagem não encontrada.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
