import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@trpy/database';
import {
  createVerificationCode,
  sendVerificationEmail,
} from '@/lib/services/verification';

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // ── Validation ────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'name_required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email_required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'password_min_length' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json({ error: 'phone_required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'email_invalid' }, { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: 'phone_invalid' }, { status: 400 });
    }

    // ── Check existing user ───────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // User exists but not verified — resend code
      if (!existingUser.emailVerified && existingUser.password) {
        const { code } = await createVerificationCode(normalizedEmail, normalizedPhone);

        if (existingUser.phone !== normalizedPhone) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { phone: normalizedPhone },
          });
        }

        const emailResult = await sendVerificationEmail(
          normalizedEmail,
          code,
          existingUser.name ?? undefined,
        );
        console.log('[signup] resent verification email:', emailResult);

        return NextResponse.json(
          { requiresVerification: true, email: normalizedEmail, message: 'verification_resent' },
          { status: 200 },
        );
      }

      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }

    // ── Hash password ─────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Create user (unverified) ──────────────────────
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        emailVerified: null,
      },
      select: { id: true, email: true, name: true },
    });

    // ── Generate code and send email ──────────────────
    const { code } = await createVerificationCode(normalizedEmail, normalizedPhone);

    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      code,
      user.name ?? undefined,
    );
    console.log('[signup] sent verification email:', emailResult);

    return NextResponse.json(
      { requiresVerification: true, email: user.email, message: 'verification_sent' },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      '[signup] Error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
    );
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
