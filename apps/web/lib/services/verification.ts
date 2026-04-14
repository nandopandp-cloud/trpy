import { Resend } from 'resend';
import twilio from 'twilio';
import { prisma } from '@trpy/database';

// ── Config (lazy init to avoid build-time errors) ───────────────────────────

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'TRPY <noreply@trpy.app>';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER ?? '';

// ── Generate OTP ────────────────────────────────────────────────────────────

function generateCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

// ── Create & Store Code ─────────────────────────────────────────────────────

export async function createVerificationCode(email: string, phone?: string) {
  // Invalidate old codes for this email
  await prisma.verificationCode.updateMany({
    where: { email, verified: false },
    data: { expiresAt: new Date(0) },
  });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  const record = await prisma.verificationCode.create({
    data: {
      email,
      phone: phone ?? null,
      code,
      type: 'signup',
      expiresAt,
    },
  });

  return { id: record.id, code, expiresAt };
}

// ── Send Email ──────────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, code: string, name?: string) {
  const resend = getResend();
  if (!resend) {
    console.warn('[verification] Resend not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${code} — Código de verificação TRPY`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 460px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">TRPY</h1>
          </div>
          <p style="font-size: 15px; color: #333; margin: 0 0 8px;">
            ${name ? `Olá, ${name}!` : 'Olá!'}
          </p>
          <p style="font-size: 15px; color: #555; margin: 0 0 24px;">
            Seu código de verificação é:
          </p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #18181b; font-family: monospace;">
              ${code}
            </span>
          </div>
          <p style="font-size: 13px; color: #888; margin: 0;">
            Este código expira em ${CODE_EXPIRY_MINUTES} minutos. Se você não solicitou esta verificação, ignore este email.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('[verification] Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// ── Send SMS ────────────────────────────────────────────────────────────────

export async function sendVerificationSMS(phone: string, code: string) {
  const twilioClient = getTwilioClient();
  if (!twilioClient || !TWILIO_PHONE) {
    console.warn('[verification] Twilio not configured, skipping SMS');
    return { success: false, error: 'SMS not configured' };
  }

  try {
    await twilioClient.messages.create({
      body: `TRPY - Seu código de verificação: ${code}. Válido por ${CODE_EXPIRY_MINUTES} minutos.`,
      from: TWILIO_PHONE,
      to: phone,
    });
    return { success: true };
  } catch (error) {
    console.error('[verification] SMS send error:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
}

// ── Verify Code ─────────────────────────────────────────────────────────────

export async function verifyCode(email: string, code: string) {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: 'signup',
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { valid: false, error: 'invalid_or_expired' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: 'max_attempts' };
  }

  // Increment attempts
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (record.code !== code) {
    return { valid: false, error: 'invalid_code' };
  }

  // Mark as verified
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { valid: true };
}

// ── Send Both ───────────────────────────────────────────────────────────────

export async function sendVerificationCodes(
  email: string,
  code: string,
  name?: string,
  phone?: string,
) {
  const results = await Promise.allSettled([
    sendVerificationEmail(email, code, name),
    phone ? sendVerificationSMS(phone, code) : Promise.resolve({ success: false, error: 'no_phone' }),
  ]);

  const emailResult = results[0].status === 'fulfilled' ? results[0].value : { success: false };
  const smsResult = results[1].status === 'fulfilled' ? results[1].value : { success: false };

  return { email: emailResult.success, sms: smsResult.success };
}
