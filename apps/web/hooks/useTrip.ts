'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Trip, ItineraryDay, ItineraryItem, Expense } from '@trpy/database';

export type TripDetail = Trip & {
  itineraryDays: (ItineraryDay & { items: ItineraryItem[] })[];
  expenses: Expense[];
};

async function fetchTrip(id: string): Promise<TripDetail> {
  const res = await fetch(`/api/trips/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

async function updateTrip(id: string, data: Partial<Trip>) {
  const res = await fetch(`/api/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data as Trip;
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => fetchTrip(id),
    enabled: !!id,
  });
}

export function useUpdateTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Trip>) => updateTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
