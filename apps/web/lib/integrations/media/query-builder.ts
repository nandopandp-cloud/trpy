// ─── Smart query expansion ───────────────────────────────────────────────────
//
// One user query ("Paris") becomes several focused queries to increase
// photo variety and relevance. We run a primary query and a couple of
// secondary ones, then merge & dedupe.

const IMAGE_MODIFIERS = [
  'travel',
  'city skyline',
  'landmarks',
  'aesthetic',
] as const;

const VIDEO_MODIFIERS = [
  'travel',
  'aerial drone',
  'cinematic',
] as const;

export function buildImageQueries(base: string): string[] {
  const cleaned = base.trim();
  if (!cleaned) return [];
  return [cleaned, ...IMAGE_MODIFIERS.map((m) => `${cleaned} ${m}`)];
}

export function buildVideoQueries(base: string): string[] {
  const cleaned = base.trim();
  if (!cleaned) return [];
  return [cleaned, ...VIDEO_MODIFIERS.map((m) => `${cleaned} ${m}`)];
}
