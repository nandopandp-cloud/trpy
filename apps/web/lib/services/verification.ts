import { Resend } from 'resend';
import { prisma } from '@trpy/database';

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? 'TRPY <noreply@trpy.app>';
}

// ── Generate OTP ────────────────────────────────────────────────────────────

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// ── Create & Store Code ─────────────────────────────────────────────────────

export async function createVerificationCode(email: string, phone?: string) {
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
    console.error('[verification] RESEND_API_KEY not set');
    return { success: false, error: 'Email not configured' };
  }

  const displayName = name ?? 'viajante';
  const fromEmail = getFromEmail();

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${code} — Código de verificação TRPY`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verifique sua conta - Trpy</title>
</head>
<body style="margin:0; padding:0; background:#050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px; width:100%; background:#0B0B0F; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">

          <tr>
            <td style="padding:28px 32px;">
              <span style="font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:-0.5px;">TRPY</span>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <h1 style="margin:0; font-size:28px; color:#FFFFFF; font-weight:700;">
                Sua jornada começa agora, ${displayName} ✈️
              </h1>
              <p style="margin:12px 0 24px; color:#A1A1AA; font-size:16px; line-height:1.6;">
                Estamos prontos para te levar mais longe. Use o código abaixo para verificar sua conta e começar a planejar sua próxima aventura.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px; background:rgba(255,255,255,0.06);"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px;">
              <p style="margin:0 0 14px; color:#6B7280; font-size:14px;">
                Seu código de acesso:
              </p>
              <div style="padding:22px 32px; border-radius:14px; background:linear-gradient(135deg,#141422,#0F0F18); border:1px solid rgba(124,92,255,0.2); display:inline-block;">
                <span style="font-size:36px; letter-spacing:10px; font-weight:700; color:#FFFFFF; font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin:14px 0 0; color:#6B7280; font-size:13px;">
                Este código expira em ${CODE_EXPIRY_MINUTES} minutos.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <div style="border-radius:16px; padding:20px; background:linear-gradient(135deg,rgba(124,92,255,0.08),rgba(77,175,255,0.08)); border:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0; color:#FFFFFF; font-weight:500; font-size:15px;">✨ Planeje. Explore. Viva.</p>
                <p style="margin:6px 0 0; color:#9CA3AF; font-size:14px;">Seu próximo destino está a poucos cliques de distância.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0; font-size:13px; color:#6B7280;">
                Se você não solicitou esta verificação, ignore este email. &copy; 2026 Trpy.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (response.error) {
      console.error('[verification] Resend error:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[verification] Email exception:', String(error));
    return { success: false, error: 'Failed to send email' };
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

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (record.code !== code) {
    return { valid: false, error: 'invalid_code' };
  }

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { valid: true };
}

// ── Send Verification ────────────────────────────────────────────────────────

export async function sendVerificationCodes(
  email: string,
  code: string,
  name?: string,
  phone?: string,
) {
  const result = await sendVerificationEmail(email, code, name);
  return { email: result.success, sms: false };
}
