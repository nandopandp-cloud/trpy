// ═══════════════════════════════════════════════════════════════════════════
// Rate limiter em memória — protege endpoints caros (Google APIs) contra
// abuso de um mesmo cliente. Algoritmo: sliding window contador por chave.
//
// Por que em memória e não Upstash/Redis?
//   - Projeto ainda não tem store externo provisionado.
//   - Cada instância serverless do Vercel mantém seu próprio contador, o que
//     subestima um pouco o volume por IP em runtime distribuído. Aceitável
//     para um limit de proteção (não de fairness): o objetivo é cortar bursts
//     anômalos, não fazer quota preciso por usuário.
//   - O cost-guard global (baseado em DB) é quem enforça o teto de custo real.
// ═══════════════════════════════════════════════════════════════════════════

import type { NextRequest } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

interface RateLimitConfig {
  /** Janela em ms */
  windowMs: number;
  /** Máximo de requests dentro da janela */
  max: number;
  /** Prefixo da chave — separa contadores por endpoint */
  key: string;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  // Fallback: NextRequest.ip pode ser undefined em alguns ambientes
  return (req as unknown as { ip?: string }).ip ?? 'unknown';
}

export function checkRateLimit(req: NextRequest, cfg: RateLimitConfig): RateLimitResult {
  const ip = getClientIp(req);
  const key = `${cfg.key}:${ip}`;
  const now = Date.now();

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    // GC leve: se o Map estourar, descartamos as chaves expiradas.
    if (buckets.size >= MAX_BUCKETS) {
      const toDelete: string[] = [];
      buckets.forEach((b, k) => { if (b.resetAt < now) toDelete.push(k); });
      toDelete.forEach((k) => buckets.delete(k));
    }
    buckets.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { limited: false, remaining: cfg.max - 1, resetAt: now + cfg.windowMs };
  }

  bucket.count += 1;

  if (bucket.count > cfg.max) {
    return { limited: true, remaining: 0, resetAt: bucket.resetAt };
  }

  return { limited: false, remaining: cfg.max - bucket.count, resetAt: bucket.resetAt };
}
