export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { autocomplete } from '@/lib/integrations/google/places-service';

/**
 * GET /api/places/autocomplete?q=paris&session=<token>
 *
 * Proxy seguro para a Google Places Autocomplete API.
 * A chave nunca vai ao frontend — todas as chamadas passam por aqui.
 *
 * Parâmetros:
 *   q        — texto digitado pelo usuário (mín. 2 caracteres)
 *   session  — session token (opcional, mas reduz custo de billing)
 *
 * Resposta:
 *   { results: AutocompleteResult[] }
 *
 * Cache:
 *   Queries curtas (≤3 chars) têm revalidação 60s;
 *   queries mais longas têm 5 min — são mais específicas e menos voláteis.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const session = req.nextUrl.searchParams.get('session') ?? undefined;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await autocomplete(q, session);
    const ttl = q.length <= 3 ? 60 : 300;
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=60` } },
    );
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
