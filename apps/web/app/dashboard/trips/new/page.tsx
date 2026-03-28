'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTrip } from '@/hooks/useTrips';
import { TripForm, type TripFormValues } from '@/components/trips/trip-form';
import { Button } from '@/components/ui/button';

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();

  async function handleSubmit(values: TripFormValues) {
    await createTrip.mutateAsync({
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    });
    toast.success('Viagem criada com sucesso!');
    router.push('/dashboard/trips');
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nova viagem</h1>
              <p className="text-sm text-muted-foreground">Preencha os dados para começar</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <TripForm onSubmit={handleSubmit} submitLabel="Criar viagem" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
