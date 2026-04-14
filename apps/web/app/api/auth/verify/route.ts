import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@trpy/database';
import { verifyCode } from '@/lib/services/verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'missing_fields' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    // ── Verify the code ───────────────────────────────
    const result = await verifyCode(normalizedEmail, normalizedCode);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 },
      );
    }

    // ── Mark user as verified ─────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'user_not_found' },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json(
      {
        verified: true,
        email: normalizedEmail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[verify] Error:', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 },
    );
  }
}
