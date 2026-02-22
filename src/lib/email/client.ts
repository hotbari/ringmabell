import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

interface SendReminderEmailParams {
  to: string;
  aspirationTitle: string;
  reminderContent: string;
}

export async function sendReminderEmail({
  to,
  aspirationTitle,
  reminderContent,
}: SendReminderEmailParams) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: 'RingMaBell <onboarding@resend.dev>',
    to: [to],
    subject: `A gentle reminder about: ${aspirationTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">RingMaBell</h1>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #667eea; margin-top: 0;">${aspirationTitle}</h2>
            ${reminderContent
              .split('\n\n')
              .map((p) => `<p style="margin: 16px 0;">${p}</p>`)
              .join('')}
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">
              This is a reminder from your RingMaBell aspirations.<br>
              <a href="#" style="color: #667eea;">View your aspirations</a>
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }

  return data;
}
