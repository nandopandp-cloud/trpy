import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400;

// GET /api/place-photo?ref=PHOTO_REFERENCE&maxwidth=400
// Proxy que resolve a foto do Google Places no servidor,
// evitando problemas de CORS/referrer com a chave de API
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  const maxwidth = req.nextUrl.searchParams.get('maxwidth') ?? '400';

  if (!ref) {
    return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${ref}&key=${key}`;

  const res = await fetch(url, { redirect: 'follow' });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 502 });
  }

  const imageBuffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
