import { NextRequest, NextResponse } from 'next/server';
import { withGoogleGuard } from '@/lib/integrations/google/cost-guard';

export const revalidate = 604800;

// GET /api/place-photo?ref=PHOTO_REFERENCE&maxwidth=400
// Proxy que resolve fotos do Google Places no servidor, mantendo a chave
// fora do browser e respeitando o kill switch de custo.
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  const maxwidthParam = req.nextUrl.searchParams.get('maxwidth') ?? '400';

  // Validação: photo_reference do Google é um base64-like curto. Aceita apenas
  // caracteres seguros e tamanhos plausíveis para evitar SSRF via parâmetro.
  if (!ref || ref.length < 20 || ref.length > 2048 || !/^[A-Za-z0-9_\-]+$/.test(ref)) {
    return NextResponse.json({ error: 'invalid_ref' }, { status: 400 });
  }

  // maxwidth: whitelist de valores plausíveis (evita 1×1 ou 10000px abuse).
  const maxwidth = Math.max(200, Math.min(1600, Number.parseInt(maxwidthParam, 10) || 400));

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const guarded = await withGoogleGuard('photo', async () => {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${ref}&key=${key}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('photo_fetch_failed');
    return {
      buffer: await res.arrayBuffer(),
      contentType: res.headers.get('content-type') ?? 'image/jpeg',
    };
  });

  if (guarded.blocked) {
    // Sem imagem disponível — devolve 204 para que a UI mostre o fallback
    // (skeleton/placeholder) ao invés de quebrar.
    return new NextResponse(null, {
      status: 204,
      headers: { 'x-photo-blocked': guarded.reason ?? 'unknown' },
    });
  }

  if (!guarded.result) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }

  return new NextResponse(guarded.result.buffer, {
    status: 200,
    headers: {
      'Content-Type': guarded.result.contentType,
      'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
    },
  });
}
