import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@trpy/database';
import {
  createVerificationCode,
  sendVerificationCodes,
} from '@/lib/services/verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'missing_email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      // Don't reveal whether user exists or is verified
      return NextResponse.json({ sent: true }, { status: 200 });
    }

    const { code } = await createVerificationCode(normalizedEmail, user.phone ?? undefined);
    await sendVerificationCodes(
      normalizedEmail,
      code,
      user.name ?? undefined,
      user.phone ?? undefined,
    );

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.error('[resend-code] Error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
