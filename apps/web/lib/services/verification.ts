import { Resend } from 'resend';
import { prisma } from '@trpy/database';

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 30;
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

  console.log(`[verification] sending email to=${email} from=${fromEmail}`);

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
  <title>Continue sua jornada - Trpy</title>
</head>
<body style="margin:0; padding:0; background:#12031b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px; width:100%; background:#0B0B0F; border-radius:20px; overflow:hidden; border:1px solid rgb(44, 3, 58);">

          <tr>
            <td style="padding:28px 32px;">
              <img src="https://trpy.vercel.app/logos/logo.png" width="90" style="display:block;" />
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <h1 style="margin:0; font-size:28px; color:#FFFFFF;">
                Sua jornada continua,<br>
                ${displayName} ✈️
              </h1>
              <p style="margin:12px 0 24px; color:#A1A1AA; font-size:16px;">
                Estamos prontos para te levar mais longe. Continue de onde parou e transforme seu próximo destino em realidade.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px 24px;">
              <a href="{{MAGIC_LINK}}" style="
                display:inline-block;
                padding:16px 28px;
                border-radius:999px;
                background: linear-gradient(90deg, #7C5CFF, #4DAFFF);
                color:#ffffff;
                font-weight:600;
                text-decoration:none;
                font-size:16px;
                box-shadow: 0 10px 30px rgba(124,92,255,0.35);
              ">
                Continuar viagem
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px; background:rgba(255,255,255,0.06);"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px;">
              <p style="margin:0; color:#6B7280; font-size:14px;">
                Use este código de acesso:
              </p>
              <div style="
                margin-top:14px;
                padding:22px;
                border-radius:14px;
                background: linear-gradient(135deg,#141422,#0F0F18);
                border:1px solid rgba(124,92,255,0.2);
              ">
                <span style="
                  font-size:34px;
                  letter-spacing:8px;
                  font-weight:700;
                  color:#FFFFFF;
                ">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <div style="
                border-radius:16px;
                padding:20px;
                background: linear-gradient(135deg, rgba(124,92,255,0.08), rgba(77,175,255,0.08));
                border:1px solid rgba(255,255,255,0.05);
              ">
                <p style="margin:0; color:#FFFFFF; font-weight:500;">
                  ✨ Planeje. Explore. Viva.
                </p>
                <p style="margin:6px 0 0; color:#9CA3AF; font-size:14px;">
                  Seu próximo destino está a poucos cliques de distância.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0; font-size:13px; color:#6B7280;">
                © 2026 Trpy — Transformando sonhos em jornadas reais.
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
      console.error('[verification] Resend error:', JSON.stringify(response.error));
      return { success: false, error: response.error.message };
    }

    console.log(`[verification] email queued id=${response.data?.id}`);
    return { success: true, id: response.data?.id };
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

// ── Send Welcome Email ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name?: string) {
  const resend = getResend();
  if (!resend) return { success: false };

  const displayName = name ?? 'viajante';
  const fromEmail = getFromEmail();

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Bem-vindo à Trpy, ${displayName}! ✈️`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Bem-vindo à Trpy</title>
</head>
<body style="margin:0; padding:0; background:#09090b; font-family:Inter, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">
<table width="640" style="max-width:640px; width:100%; background:#0B0B0F; border-radius:24px; overflow:hidden; border:1px solid rgba(99,102,241,0.15);">

<tr>
<td style="padding:28px 32px;">
<a href="https://www.trpy.com.br/" target="_blank">
  <img src="https://trpy.vercel.app/logos/logo.png" width="90"/>
</a>
</td>
</tr>

<tr>
<td>
  <img src="https://trpy.vercel.app/email/photo-cover.jpg" width="100%" style="display:block; height:320px; object-fit:cover;"/>
</td>
</tr>

<tr>
<td style="padding:40px 32px 24px; text-align:center;">
  <h1 style="margin:0; font-size:32px; color:#FFFFFF; line-height:1.2;">
    Sua próxima viagem começa agora ✈️
  </h1>
  <p style="margin:16px 0 0; color:#A1A1AA; font-size:16px; line-height:1.6;">
    Bem-vindo à Trpy, ${displayName}.<br/>
    Planeje, descubra e viva experiências incríveis com inteligência.
  </p>
</td>
</tr>

<tr>
<td align="center" style="padding:0 32px 40px;">
  <a href="https://www.trpy.com.br" style="display:inline-block; padding:18px 34px; border-radius:999px; background:linear-gradient(90deg,#6366f1,#8b5cf6,#f59e0b); color:#ffffff; font-weight:600; text-decoration:none; font-size:16px; box-shadow:0 10px 40px rgba(99,102,241,0.4);">
    Começar minha viagem
  </a>
</td>
</tr>

<tr>
<td style="padding:0 24px 32px;">
<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td width="50%" style="padding:4px;">
<img src="https://trpy.vercel.app/email/photo-block-1.jpg" style="width:100%; border-radius:14px; height:140px; object-fit:cover;"/>
</td>
<td width="50%" style="padding:4px;">
<img src="https://trpy.vercel.app/email/photo-block-2.jpg" style="width:100%; border-radius:14px; height:140px; object-fit:cover;"/>
</td>
</tr>
<tr>
<td width="50%" style="padding:4px;">
<img src="https://trpy.vercel.app/email/photo-block-3.jpg" style="width:100%; border-radius:14px; height:140px; object-fit:cover;"/>
</td>
<td width="50%" style="padding:4px;">
<img src="https://trpy.vercel.app/email/photo-block-4.jpg" style="width:100%; border-radius:14px; height:140px; object-fit:cover;"/>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 32px 40px;">
<p style="color:#FFFFFF; font-size:18px; margin-bottom:20px;">Tudo que você precisa, num só lugar:</p>

<div style="padding:18px; border-radius:16px; background:#111118; border:1px solid rgba(255,255,255,0.05); margin-bottom:12px;">
<strong style="color:#fff;">🧠 Planejamento inteligente</strong>
<p style="margin:6px 0 0; color:#A1A1AA; font-size:14px;">Monte roteiros completos com ajuda de Inteligência Artificial</p>
</div>

<div style="padding:18px; border-radius:16px; background:#111118; border:1px solid rgba(255,255,255,0.05); margin-bottom:12px;">
<strong style="color:#fff;">💰 Controle financeiro</strong>
<p style="margin:6px 0 0; color:#A1A1AA; font-size:14px;">Acompanhe todos os gastos da sua viagem antes, durante e depois em um só lugar.</p>
</div>

<div style="padding:18px; border-radius:16px; background:#111118; border:1px solid rgba(255,255,255,0.05);">
<strong style="color:#fff;">🌍 Descubra destinos</strong>
<p style="margin:6px 0 0; color:#A1A1AA; font-size:14px;">Explore lugares com fotos, reviews, vídeos e muito mais.</p>
</div>
</td>
</tr>

<tr>
<td style="padding:0 32px 40px;">
<div style="border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
  <img src="https://trpy.vercel.app/email/photo-footer.jpg" width="100%" style="height:200px; object-fit:cover; display:block;"/>
  <div style="padding:20px; background:#0F0F18;">
    <strong style="color:#fff;">Paris, França 🇫🇷</strong>
    <p style="margin:6px 0 0; color:#9CA3AF; font-size:14px;">Um destino perfeito para começar sua jornada.</p>
  </div>
</div>
</td>
</tr>

<tr>
<td align="center" style="padding:0 32px 50px;">
<a href="https://www.trpy.com.br" style="display:inline-block; padding:18px 34px; border-radius:999px; background:linear-gradient(90deg,#6366f1,#8b5cf6,#f59e0b); color:#ffffff; font-weight:600; text-decoration:none; font-size:16px; box-shadow:0 10px 40px rgba(99,102,241,0.4);">
Explorar destinos
</a>
</td>
</tr>

<tr>
<td style="padding:0 32px 32px;">
<p style="margin:0; font-size:12px; color:#6B7280;">© 2026 Trpy — Planeje. Explore. Viva.</p>
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
      console.error('[welcome] Resend error:', JSON.stringify(response.error));
      return { success: false };
    }

    console.log(`[welcome] email queued id=${response.data?.id}`);
    return { success: true };
  } catch (error) {
    console.error('[welcome] Email exception:', String(error));
    return { success: false };
  }
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
