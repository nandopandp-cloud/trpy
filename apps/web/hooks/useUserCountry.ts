'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * País de origem do usuário em ISO 3166-1 alpha-2 (BR, US, PT...).
 *
 * Resolve em camadas:
 *   1. Cookie `trpy_country` (preenchido por /api/geo em acessos anteriores).
 *   2. Chama /api/geo, que lê o header `x-vercel-ip-country` da Vercel.
 *   3. Em último caso, retorna o fallback ('BR').
 *
 * O cookie é escrito pelo próprio endpoint, então visitas subsequentes não
 * fazem network.
 */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function useUserCountry(fallback = 'BR'): string {
  const { data } = useQuery<string>({
    queryKey: ['user-country'],
    queryFn: async () => {
      const cached = readCookie('trpy_country');
      if (cached && /^[A-Z]{2}$/.test(cached)) return cached;

      const res = await fetch('/api/geo', { cache: 'no-store' });
      if (!res.ok) return fallback;
      const json = await res.json();
      return typeof json.country === 'string' ? json.country : fallback;
    },
    staleTime: 60 * 60 * 1000, // 1h
    gcTime: 24 * 60 * 60 * 1000,
    retry: 0,
  });

  return data ?? fallback;
}
