import { NextRequest, NextResponse } from 'next/server';
import {
  getGuardStatus,
  getUsageBreakdown,
  setManualKill,
} from '@/lib/integrations/google/cost-guard';

export const dynamic = 'force-dynamic';

/**
 * Endpoint admin para:
 *   - GET:  inspecionar uso atual e status do kill switch
 *   - POST: acionar/desacionar kill switch manual
 *
 * Autenticação: header `x-admin-secret` OU query `?secret=` com o valor de
 * process.env.ADMIN_SECRET. Em produção, prefira o header.
 *
 * Uso:
 *   curl https://trpy.com/api/admin/google-usage -H "x-admin-secret: XXX"
 *   curl -X POST https://trpy.com/api/admin/google-usage -H "x-admin-secret: XXX" \
 *        -H "content-type: application/json" -d '{"killed": true}'
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;
  const header = req.headers.get('x-admin-secret');
  const query = req.nextUrl.searchParams.get('secret');
  return header === ADMIN_SECRET || query === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const status = await getGuardStatus();
  const breakdown = await getUsageBreakdown();

  return NextResponse.json({
    status: {
      blocked: status.blocked,
      reason: status.reason,
      usagePercent: Number(status.usagePercent.toFixed(2)),
      totalUsd: (status.totalCents / 100).toFixed(2),
      budgetUsd: (status.budgetCents / 100).toFixed(2),
      period: status.period,
    },
    breakdown: breakdown.entries.map((e) => ({
      operation: e.operation,
      calls: e.callCount,
      costUsd: e.costUsd.toFixed(2),
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { killed?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (typeof body.killed !== 'boolean') {
    return NextResponse.json({ error: 'killed_required' }, { status: 400 });
  }

  await setManualKill(body.killed);
  const status = await getGuardStatus();
  return NextResponse.json({ ok: true, blocked: status.blocked, reason: status.reason });
}
