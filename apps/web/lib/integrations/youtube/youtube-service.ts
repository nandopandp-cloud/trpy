export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function getApiKey() {
  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY not configured');
  return key;
}

async function searchVideos(q: string, maxResults = 6): Promise<YouTubeVideo[]> {
  const key = getApiKey();
  const params = new URLSearchParams({
    part: 'snippet',
    q,
    type: 'video',
    maxResults: String(maxResults),
    relevanceLanguage: 'pt',
    key,
  });

  const res = await fetch(`${BASE_URL}/search?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

export async function searchVideosByDestination(destination: string): Promise<YouTubeVideo[]> {
  return searchVideos(`viagem ${destination} guia turístico`);
}

export async function searchActivityVideos(activity: string, location: string): Promise<YouTubeVideo[]> {
  return searchVideos(`${activity} ${location}`);
}

export async function searchRestaurantVideos(restaurant: string, location: string): Promise<YouTubeVideo[]> {
  return searchVideos(`restaurante ${restaurant} ${location} review`);
}

export async function getTrendingTravelVideos(): Promise<YouTubeVideo[]> {
  return searchVideos('melhores destinos viagem 2025', 8);
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const key = getApiKey();
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoId,
    key,
  });

  const res = await fetch(`${BASE_URL}/videos?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics?.viewCount,
    duration: item.contentDetails?.duration,
  };
}
