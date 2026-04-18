import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@trpy/database';
import { sendWelcomeEmail } from '@/lib/services/verification';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// One-time batch route to send welcome emails to existing users
// Call with: GET /api/auth/send-welcome-batch?secret=<ADMIN_SECRET>&dry=true (preview)
//            GET /api/auth/send-welcome-batch?secret=<ADMIN_SECRET>           (real send)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const dry = searchParams.get('dry') === 'true';

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { email: { not: undefined } },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (dry) {
    return NextResponse.json({
      dry: true,
      total: users.length,
      users: users.map((u) => ({ email: u.email, name: u.name })),
    });
  }

  const results: { email: string; success: boolean }[] = [];

  for (const user of users) {
    if (!user.email) continue;
    // 300ms gap between sends to avoid Resend rate limits
    await new Promise((r) => setTimeout(r, 300));
    const result = await sendWelcomeEmail(user.email, user.name ?? undefined);
    results.push({ email: user.email, success: result.success });
    console.log(`[welcome-batch] ${user.email} → ${result.success ? 'ok' : 'fail'}`);
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  return NextResponse.json({ total: users.length, sent, failed });
}
