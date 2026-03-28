import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPins, searchByTheme } from '@/lib/integrations/pinterest/pinterest-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q');
    const destination = searchParams.get('destination');
    const theme = searchParams.get('theme') as 'travel' | 'food' | 'architecture' | 'nature' | 'culture' | null;

    if (!query && !destination) {
      return err('Parâmetro q ou destination é obrigatório');
    }

    let pins;
    if (destination && theme) {
      pins = await searchByTheme(destination, theme);
    } else {
      pins = await searchPins(query ?? destination!);
    }

    return ok(pins);
  } catch (error) {
    return handleError(error);
  }
}
