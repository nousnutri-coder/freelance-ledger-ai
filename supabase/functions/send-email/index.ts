/**
 * Send Email Edge Function
 *
 * Envía correos transaccionales usando SMTP de Gmail.
 * Las credenciales se almacenan como secrets de Edge Function.
 *
 * Variables de entorno requeridas:
 * - SMTP_HOST: smtp.gmail.com
 * - SMTP_PORT: 587
 * - SMTP_USER: aissistpro9@gmail.com
 * - SMTP_PASS: contraseña de aplicación de Gmail
 * - SMTP_SENDER: Freelance Ledger <aissistpro9@gmail.com>
 */

import { SmtpClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: SendEmailRequest = await req.json();

    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get SMTP config from environment secrets
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER') || 'aissistpro9@gmail.com';
    const smtpPass = Deno.env.get('SMTP_PASS') || '';
    const smtpSender = Deno.env.get('SMTP_SENDER') || 'Freelance Ledger <aissistpro9@gmail.com>';

    if (!smtpPass) {
      console.error('SMTP_PASS not configured in Edge Function secrets');
      return new Response(
        JSON.stringify({ success: false, error: 'SMTP not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SMTP client
    const client = new SmtpClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    await client.connect();

    // Parse sender name and email
    const senderMatch = smtpSender.match(/^(.+?)\s*<(.+?)>$/);
    const fromName = senderMatch ? senderMatch[1].trim() : smtpSender;
    const fromEmail = senderMatch ? senderMatch[2].trim() : smtpUser;

    // Send the email
    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: body.to,
      cc: body.cc?.join(', '),
      bcc: body.bcc?.join(', '),
      subject: body.subject,
      html: body.html,
    });

    await client.close();

    console.log(`✅ Email sent to ${body.to}: "${body.subject}"`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
