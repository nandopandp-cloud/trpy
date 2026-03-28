'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Trip, TripStatus } from '@trpy/database';

interface TripsResponse {
  trips: Trip[];
  total: number;
  limit: number;
  offset: number;
}

interface CreateTripInput {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  coverImage?: string;
  currency?: string;
}

async function fetchTrips(params: { status?: TripStatus; limit?: number; offset?: number } = {}) {
  const url = new URL('/api/trips', window.location.origin);
  if (params.status) url.searchParams.set('status', params.status);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.offset) url.searchParams.set('offset', String(params.offset));

  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data as TripsResponse;
}

async function createTrip(input: CreateTripInput) {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data as Trip;
}

async function deleteTrip(id: string) {
  const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useTrips(params: { status?: TripStatus; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => fetchTrips(params),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}
