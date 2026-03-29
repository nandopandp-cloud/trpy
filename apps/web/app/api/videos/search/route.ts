import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { ok, err, handleError } from '@/lib/api';
import {
  searchVideosByDestination,
  searchActivityVideos,
  getTrendingTravelVideos,
} from '@/lib/integrations/youtube/youtube-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const destination = searchParams.get('destination');
    const activity = searchParams.get('activity');
    const trending = searchParams.get('trending');

    let videos;
    if (trending) {
      videos = await getTrendingTravelVideos();
    } else if (activity && destination) {
      videos = await searchActivityVideos(activity, destination);
    } else if (destination) {
      videos = await searchVideosByDestination(destination);
    } else {
      return err('Parâmetro destination é obrigatório');
    }

    return ok(videos);
  } catch (error) {
    return handleError(error);
  }
}
