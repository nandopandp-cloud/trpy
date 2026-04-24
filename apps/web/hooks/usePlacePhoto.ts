'use client';

import { useDestinationPhoto } from './useDestinationPhoto';

/**
 * Foto para um Place do Google (restaurante, hotel, atração) usando
 * APENAS Pexels/Unsplash — nunca a Photos API do Google (cara: $7/1k).
 *
 * Estratégia: monta um query string com nome + cidade/região para que o
 * media engine (Pexels primary + Unsplash secondary) retorne uma foto
 * relevante. Como nem sempre acha uma foto exata do estabelecimento,
 * usamos types do Google como fallback semântico ("restaurant", "hotel").
 *
 * Aproveita 100% do cache do hook base: 24h client + 24h edge.
 */
export function usePlacePhoto({
  name,
  address,
  types,
}: {
  name?: string | null;
  address?: string | null;
  types?: string[] | null;
}): string | null {
  const query = buildPlaceQuery({ name, address, types });
  return useDestinationPhoto(query);
}

function buildPlaceQuery(opts: {
  name?: string | null;
  address?: string | null;
  types?: string[] | null;
}): string | null {
  const name = opts.name?.trim();
  if (!name) return null;

  // Pega a cidade (último segmento útil do endereço, exclui CEP/país terminal)
  const city = extractCity(opts.address);

  // Usa o tipo mais específico que reconhecemos como semântico de imagem
  const semanticType = pickSemanticType(opts.types);

  const parts = [name];
  if (city) parts.push(city);
  if (semanticType) parts.push(semanticType);
  return parts.join(' ');
}

function extractCity(address?: string | null): string | null {
  if (!address) return null;
  // Endereços vêm no formato "Rua, 123 - Bairro, Cidade - UF, CEP, País"
  // Pegar o segmento penúltimo (cidade-UF) costuma funcionar.
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  // Heurística: pega o segmento que parece ter "Cidade - UF" ou cidade
  const candidate = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  // Remove CEP solto
  return candidate.replace(/\b\d{4,}\b/g, '').replace(/\s+-\s+\w{2}$/, '').trim() || null;
}

const TYPE_SEMANTIC: Record<string, string> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  bar: 'bar',
  bakery: 'bakery',
  lodging: 'hotel',
  hotel: 'hotel',
  museum: 'museum',
  art_gallery: 'art gallery',
  tourist_attraction: 'landmark',
  park: 'park',
  church: 'church',
  beach: 'beach',
};

function pickSemanticType(types?: string[] | null): string | null {
  if (!types?.length) return null;
  for (const t of types) {
    const mapped = TYPE_SEMANTIC[t];
    if (mapped) return mapped;
  }
  return null;
}
