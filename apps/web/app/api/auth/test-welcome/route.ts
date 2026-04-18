import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/services/verification';

// Temporary test route — remove after confirming welcome email works
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const name = searchParams.get('name') ?? 'Fernando';

  if (!email) {
    return NextResponse.json({ error: 'Pass ?email=you@example.com' }, { status: 400 });
  }

  const result = await sendWelcomeEmail(email, name);
  return NextResponse.json(result);
}
