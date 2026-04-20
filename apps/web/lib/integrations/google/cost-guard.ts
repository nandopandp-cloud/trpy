// ═══════════════════════════════════════════════════════════════════════════
// Cost Guard — kill switch + tracking de custo da Google Places API.
//
// Proteção em três camadas:
//   1) Hard kill: variável de ambiente GOOGLE_API_DISABLED=true derruba tudo.
//   2) Manual kill: flag `killed` no banco (via endpoint admin).
//   3) Budget kill: ao acumular custo >= GOOGLE_MONTHLY_BUDGET_USD no mês,
//      o guard bloqueia novas chamadas até o mês seguinte (reset natural
//      pelo `period = YYYY-MM`).
//
// Tudo o que é chamada ao Google passa por `withGoogleGuard(operation, fn)`
// — se o guard bloquear, a promise resolve com `{ blocked: true, result: null }`
// e o caller devolve o melhor resultado local/cacheado possível.
// ═══════════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';

// ─── Preços (USD) — baseados no SKU pricing da Google Places (out/2024) ─────
// Fonte: https://developers.google.com/maps/billing-and-pricing/pricing
// Usamos o valor "Basic SKU" médio para cada operação. Valores em centavos
// para evitar erros de float cumulativos. Atualize aqui se o Google revisar
// preços.

export type GoogleOperation =
  | 'autocomplete'       // $2.83 per 1k (com session) → 0.283¢/call
  | 'details'            // $17 per 1k Basic → 1.7¢/call
  | 'text_search'        // $32 per 1k → 3.2¢/call
  | 'photo'              // $7 per 1k → 0.7¢/call
  | 'geocode';           // $5 per 1k → 0.5¢/call

const COST_PER_CALL_CENTS: Record<GoogleOperation, number> = {
  autocomplete: 0.283,
  details:      1.7,
  text_search:  3.2,
  photo:        0.7,
  geocode:      0.5,
};

// ─── Configuração ────────────────────────────────────────────────────────────

const PROVIDER = 'google_places';

/**
 * Budget mensal em USD. Default: US$ 80 ≈ R$400 a câmbio ~5.0 BRL/USD.
 * Ajustável via env. Se mudar o câmbio muito, revisite.
 */
function monthlyBudgetCents(): number {
  const raw = process.env.GOOGLE_MONTHLY_BUDGET_USD;
  const usd = raw ? Number.parseFloat(raw) : 80;
  return Math.round((Number.isFinite(usd) ? usd : 80) * 100);
}

function hardKilledViaEnv(): boolean {
  return process.env.GOOGLE_API_DISABLED === 'true';
}

function currentPeriod(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// ─── Cache em processo (evita hit no DB a cada call) ─────────────────────────
// Revalida a cada 30s — suficiente pra reagir rápido, leve o bastante pra não
// virar gargalo. Em tráfego alto, o Postgres não vira rate limiter.

interface StatusSnapshot {
  totalCents: number;
  killed: boolean;
  fetchedAt: number;
}

let snapshot: StatusSnapshot | null = null;
const SNAPSHOT_TTL_MS = 30 * 1000;

async function readStatus(): Promise<StatusSnapshot> {
  const now = Date.now();
  if (snapshot && now - snapshot.fetchedAt < SNAPSHOT_TTL_MS) {
    return snapshot;
  }

  const period = currentPeriod();
  const rows = await prisma.apiUsage.findMany({
    where: { provider: PROVIDER, period },
    select: { costCents: true, killed: true },
  });

  const totalCents = rows.reduce((acc, r) => acc + r.costCents, 0);
  const killed = rows.some((r) => r.killed);

  snapshot = { totalCents, killed, fetchedAt: now };
  return snapshot;
}

function invalidateSnapshot() {
  snapshot = null;
}

// ─── Status público ──────────────────────────────────────────────────────────

export interface GuardStatus {
  blocked: boolean;
  reason: 'env_disabled' | 'manually_killed' | 'budget_exceeded' | null;
  period: string;
  totalCents: number;
  budgetCents: number;
  usagePercent: number;
}

export async function getGuardStatus(): Promise<GuardStatus> {
  const period = currentPeriod();
  const budgetCents = monthlyBudgetCents();

  if (hardKilledViaEnv()) {
    return {
      blocked: true, reason: 'env_disabled', period,
      totalCents: 0, budgetCents, usagePercent: 0,
    };
  }

  const { totalCents, killed } = await readStatus();
  const usagePercent = budgetCents > 0 ? (totalCents / budgetCents) * 100 : 0;

  if (killed) {
    return { blocked: true, reason: 'manually_killed', period, totalCents, budgetCents, usagePercent };
  }
  if (totalCents >= budgetCents) {
    return { blocked: true, reason: 'budget_exceeded', period, totalCents, budgetCents, usagePercent };
  }
  return { blocked: false, reason: null, period, totalCents, budgetCents, usagePercent };
}

// ─── Registro de uso (incremento atômico) ────────────────────────────────────

async function recordCall(operation: GoogleOperation, count = 1) {
  const period = currentPeriod();
  const costDelta = Math.round(COST_PER_CALL_CENTS[operation] * count);

  try {
    await prisma.apiUsage.upsert({
      where: {
        provider_period_operation: {
          provider: PROVIDER, period, operation,
        },
      },
      update: {
        callCount: { increment: count },
        costCents: { increment: costDelta },
      },
      create: {
        provider: PROVIDER, period, operation,
        callCount: count, costCents: costDelta,
      },
    });
    // Incremento local do snapshot (evita lag de 30s na decisão do próximo call)
    if (snapshot) {
      snapshot.totalCents += costDelta;
    }
  } catch (err) {
    // Falha de DB não pode derrubar a chamada em si; só loga.
    console.error('[cost-guard] recordCall failed:', err);
  }
}

// ─── Kill switch manual ──────────────────────────────────────────────────────

export async function setManualKill(killed: boolean) {
  const period = currentPeriod();
  await prisma.apiUsage.upsert({
    where: {
      provider_period_operation: {
        provider: PROVIDER, period, operation: '_manual_kill',
      },
    },
    update: { killed },
    create: {
      provider: PROVIDER, period, operation: '_manual_kill',
      callCount: 0, costCents: 0, killed,
    },
  });
  invalidateSnapshot();
}

// ─── Wrapper principal ───────────────────────────────────────────────────────

export interface GuardedResult<T> {
  blocked: boolean;
  result: T | null;
  reason: GuardStatus['reason'];
}

/**
 * Executa `fn` se o guard permitir. Em caso de bloqueio, retorna
 * { blocked: true, result: null, reason } — e o caller devolve fallback local.
 *
 * `fn` só é invocada se passar pelo guard, então o custo só é contado quando
 * a call realmente ocorrer (idealmente também só em resposta 2xx, mas
 * mantemos conservador: contamos toda chamada disparada).
 */
export async function withGoogleGuard<T>(
  operation: GoogleOperation,
  fn: () => Promise<T>,
): Promise<GuardedResult<T>> {
  const status = await getGuardStatus();
  if (status.blocked) {
    return { blocked: true, result: null, reason: status.reason };
  }

  try {
    const result = await fn();
    // Só contabiliza se a call se completou (sucesso ou erro retornado pelo Google).
    // Erros de rede/timeout ainda contam 1 tentativa — o Google pode ter cobrado
    // mesmo se o cliente timed out.
    await recordCall(operation);
    return { blocked: false, result, reason: null };
  } catch (err) {
    await recordCall(operation);
    throw err;
  }
}

// ─── Debug / admin ───────────────────────────────────────────────────────────

export async function getUsageBreakdown() {
  const period = currentPeriod();
  const rows = await prisma.apiUsage.findMany({
    where: { provider: PROVIDER, period },
    orderBy: { operation: 'asc' },
  });
  return {
    period,
    budgetCents: monthlyBudgetCents(),
    entries: rows.map((r) => ({
      operation: r.operation,
      callCount: r.callCount,
      costCents: r.costCents,
      costUsd: r.costCents / 100,
    })),
    totalCents: rows.reduce((a, r) => a + r.costCents, 0),
  };
}
