/**
 * Send Email Edge Function
 *
 * Envía correos transaccionales usando SMTP de Gmail mediante nodemailer.
 * Las credenciales se almacenan como secrets de Edge Function.
 *
 * Variables de entorno requeridas:
 *   SMTP_HOST: smtp.gmail.com
 *   SMTP_PORT: 587
 *   SMTP_USER: aissistpro9@gmail.com
 *   SMTP_PASS: contraseña de aplicación de Gmail
 *   SMTP_SENDER: Freelance Ledger <aissistpro9@gmail.com>
 */

import nodemailer from 'npm:nodemailer@6.9.16';

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  text?: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  // Only POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: SendEmailRequest = await req.json();

    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers }
      );
    }

    // SMTP config from secrets
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER') || 'aissistpro9@gmail.com';
    const smtpPass = Deno.env.get('SMTP_PASS') || '';
    const smtpSender = Deno.env.get('SMTP_SENDER') || 'Freelance Ledger <aissistpro9@gmail.com>';

    // Check for missing SMTP_PASS
    if (!smtpPass) {
      console.error('SMTP_PASS not configured in Edge Function secrets');
      return new Response(
        JSON.stringify({ success: false, error: 'SMTP not configured - SMTP_PASS is missing' }),
        { status: 500, headers }
      );
    }

    // Parse sender
    const senderMatch = smtpSender.match(/^(.+?)\s*<(.+?)>$/);
    const fromName = senderMatch ? senderMatch[1].trim() : 'Freelance Ledger';
    const fromEmail = senderMatch ? senderMatch[2].trim() : smtpUser;

    // Create transporter - try port 465 with SSL first, fallback to 587 STARTTLS
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (verifyErr) {
      console.error('SMTP verification failed:', verifyErr);
      // Continue anyway
    }

    // Send mail
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: body.to,
      cc: body.cc?.join(', '),
      bcc: body.bcc?.join(', '),
      subject: body.subject,
      html: body.html,
      text: body.text || body.html.replace(/<[^>]*>/g, ''),
    });

    console.log(`✅ Email sent to ${body.to}: "${body.subject}" (messageId: ${info.messageId})`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', messageId: info.messageId }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers }
    );
  }
});
