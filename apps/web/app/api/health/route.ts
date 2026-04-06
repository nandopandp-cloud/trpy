export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, unknown> = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'NOT SET',
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    },
  };

  // Test database connection
  try {
    const { prisma } = await import('@trpy/database');
    const count = await prisma.user.count();
    checks.database = { connected: true, userCount: count };
  } catch (error) {
    const err = error as Error;
    checks.database = {
      connected: false,
      error: err.message,
      name: err.name,
      stack: err.stack?.split('\n').slice(0, 5),
    };
  }

  const allOk = checks.database && (checks.database as Record<string, unknown>).connected === true;

  return NextResponse.json(checks, { status: allOk ? 200 : 500 });
}
