// src/lib/email.ts — Envoi d'emails via Brevo (Sendinblue)
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@profolio.com';
const FROM_NAME = 'ProFolio+';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmailViaBrevo({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error('❌ Erreur envoi email : BREVO_API_KEY non configurée.');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur envoi email via Brevo (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email via Brevo :', error);
    return false;
  }
}

/**
 * Envoie un code OTP par email.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  return sendEmailViaBrevo({
    to: email,
    subject: '🔐 Votre code de vérification ProFolio+',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a1628; padding: 40px; border-radius: 24px; color: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://profolio.com/logo.png" alt="ProFolio+" style="width: 60px; height: 60px; border-radius: 50%;" />
          <h1 style="font-size: 20px; margin-top: 12px; color: #fff;">ProFolio<span style="color: #00E5FF;">+</span></h1>
        </div>
        <h2 style="font-size: 16px; color: rgba(255,255,255,0.8); text-align: center;">Code de vérification</h2>
        <div style="background: rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0; border: 1px solid rgba(255,255,255,0.1);">
          <p style="font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">Utilisez ce code pour vous connecter :</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #00E5FF; font-family: monospace;">${otp}</div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 16px;">Ce code expire dans 10 minutes.</p>
        </div>
        <p style="font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; margin-top: 24px;">
          Si vous n'avez pas demandé ce code, ignorez cet email.
        </p>
      </div>
    `,
  });
}

/**
 * Notifie un utilisateur qu'il a reçu un nouveau message de contact.
 */
export async function sendContactNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string
): Promise<boolean> {
  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `💬 Nouveau message de ${senderName} sur ProFolio+`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a1628; padding: 40px; border-radius: 24px; color: #fff;">
        <h1 style="font-size: 18px; color: #fff;">Nouveau message</h1>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px;">Bonjour ${recipientName},</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px;">Vous avez reçu un message de <strong style="color: #fff;">${senderName}</strong> (<a href="mailto:${senderEmail}" style="color: #00E5FF;">${senderEmail}</a>) :</p>
        <div style="background: rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; margin: 16px 0; border-left: 3px solid #00E5FF;">
          <p style="color: #fff; font-size: 14px; line-height: 1.6;">${message}</p>
        </div>
        <p style="font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; margin-top: 24px;">
          Connectez-vous à ProFolio+ pour répondre.
        </p>
      </div>
    `,
  });
}
