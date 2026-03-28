export interface PinterestPin {
  id: string;
  title?: string;
  description?: string;
  image: string;
  link?: string;
  dominantColor?: string;
  width?: number;
  height?: number;
}

const BASE_URL = 'https://api.pinterest.com/v5';

function getHeaders() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) throw new Error('PINTEREST_ACCESS_TOKEN not configured');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function searchPins(query: string, pageSize = 20): Promise<PinterestPin[]> {
  const params = new URLSearchParams({
    query,
    page_size: String(pageSize),
    ad_account_id: process.env.PINTEREST_BUSINESS_ACCOUNT_ID ?? '',
  });

  const res = await fetch(`${BASE_URL}/pins/search?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((pin: any) => ({
    id: pin.id,
    title: pin.title,
    description: pin.description,
    image: pin.media?.images?.['1200x']?.url ?? pin.media?.images?.['600x']?.url ?? '',
    link: pin.link,
    dominantColor: pin.dominant_color,
    width: pin.media?.images?.['600x']?.width,
    height: pin.media?.images?.['600x']?.height,
  }));
}

export async function searchByTheme(
  destination: string,
  theme: 'travel' | 'food' | 'architecture' | 'nature' | 'culture',
): Promise<PinterestPin[]> {
  return searchPins(`${destination} ${theme}`);
}

export async function getBoardPins(boardId: string): Promise<PinterestPin[]> {
  const res = await fetch(`${BASE_URL}/boards/${boardId}/pins?page_size=20`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((pin: any) => ({
    id: pin.id,
    title: pin.title,
    description: pin.description,
    image: pin.media?.images?.['1200x']?.url ?? pin.media?.images?.['600x']?.url ?? '',
    link: pin.link,
    dominantColor: pin.dominant_color,
  }));
}
