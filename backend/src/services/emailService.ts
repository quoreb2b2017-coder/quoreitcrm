import { Resend } from 'resend';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
}

export async function sendEmail({ to, subject, html, from, attachments }: SendEmailOptions): Promise<void> {
  if (!resend) {
    console.warn('[Email] Resend API key not set, skipping send:', { to, subject });
    return;
  }

  const { error } = await resend.emails.send({
    from: from ?? config.resend.fromEmail ?? 'noreply@example.com',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    attachments: attachments ?? [],
  });

  if (error) {
    if (config.nodeEnv !== 'production') {
      console.error('[Resend Error]', error);
    }
    throw new AppError(400, `Resend API Error: ${error.message}`);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Welcome to ATS',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created. You can now sign in and start using the ATS.</p>
    `,
  });
}
