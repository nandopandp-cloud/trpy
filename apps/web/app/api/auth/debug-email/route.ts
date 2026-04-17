import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'TRPY <noreply@trpy.app>';

  const diagnostics: Record<string, unknown> = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 10) + '...' : 'NOT SET',
    fromEmail,
    nodeEnv: process.env.NODE_ENV,
  };

  if (!apiKey) {
    return NextResponse.json({ ...diagnostics, error: 'RESEND_API_KEY not set' });
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: fromEmail,
      to: 'trpy.app@gmail.com',
      subject: 'Debug test from Vercel',
      html: '<p>Se recebeu, o envio de producao funciona.</p>',
    });

    diagnostics.resendResponse = response;
    diagnostics.success = !response.error;
  } catch (err) {
    diagnostics.error = String(err);
    diagnostics.success = false;
  }

  return NextResponse.json(diagnostics);
}
