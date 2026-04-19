export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Retorna o país de origem do usuário em ISO 3166-1 alpha-2 (ex: BR, US, PT).
 *
 * Na Vercel, o header `x-vercel-ip-country` é injetado automaticamente em cada
 * request com o país detectado pela Edge Network. Em desenvolvimento local
 * esse header não existe, então usamos fallback para 'BR'.
 *
 * Também seta um cookie curto (`trpy_country`) para que o cliente possa ler
 * síncrono sem bater na API repetidamente.
 */
export async function GET(req: NextRequest) {
  const vercelCountry = req.headers.get('x-vercel-ip-country');
  const cloudflareCountry = req.headers.get('cf-ipcountry');
  const country = (vercelCountry ?? cloudflareCountry ?? 'BR').toUpperCase();

  const res = NextResponse.json({ country });
  res.cookies.set('trpy_country', country, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h — equilíbrio entre cache e usuário em roaming
  });
  return res;
}
