/**
 * =============================================================================
 * EMAIL SERVICE — Freelance Ledger
 * =============================================================================
 * Servicio de correos transaccionales con diseño profesional unificado.
 * Los correos se envían a través de una Supabase Edge Function para
 * proteger las credenciales SMTP.
 * =============================================================================
 */

const APP_NAME = 'Freelance Ledger';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://freelance-ledger.ai';
const SUPPORT_EMAIL = 'soporte@freelaissist.com';

// =============================================================================
// EMAIL TYPES
// =============================================================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// =============================================================================
// BASE TEMPLATE — Misma línea gráfica que los emails de Supabase Auth
// =============================================================================

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <!-- Header: Logo -->
    <tr>
      <td style="text-align:center;padding:24px 0;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="width:40px;height:40px;background:linear-gradient(135deg,#059669,#10b981);border-radius:12px;text-align:center;vertical-align:middle;">
              <span style="color:white;font-size:20px;font-weight:bold;line-height:40px;">FL</span>
            </td>
            <td style="padding-left:12px;">
              <span style="font-size:20px;font-weight:800;color:#111827;">Freelance</span>
              <span style="font-size:20px;font-weight:300;color:#059669;">Ledger</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Card -->
    <tr>
      <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04);">
        ${content}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="text-align:center;padding:32px 24px;">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 8px 0;line-height:1.6;">
          ${APP_NAME} &mdash; Tu asistente financiero inteligente<br>
          &copy; ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.
        </p>
        <p style="font-size:11px;color:#d1d5db;margin:0;">
          Si tienes dudas, escr&iacute;benos a
          <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =============================================================================
// BUTTON HELPER
// =============================================================================

function buttonPrimary(url: string, text: string): string {
  return `
    <div style="text-align:center;margin:32px 0;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(url)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="25%" strokecolor="#059669" fillcolor="#059669">
        <w:anchorlock/>
        <center style="color:white;font-family:'Segoe UI',Tahoma,sans-serif;font-size:15px;font-weight:700;">${escapeHtml(text)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${escapeHtml(url)}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);mso-hide:all;">
        ${escapeHtml(text)}
      </a>
      <!--<![endif]-->
    </div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// DIVIDER HELPER
// =============================================================================

function divider(): string {
  return '<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">';
}

// =============================================================================
// SECURITY ALERT FOOTER (for sensitive changes)
// =============================================================================

function securityAlert(message: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">&#x26A0;&#xFE0F;</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">${escapeHtml(message)}</strong>
          </p>
        </td>
      </tr>
    </table>`;
}

// =============================================================================
// TEMPLATE: Confirmación de Suscripción (pago exitoso)
// =============================================================================

export function subscriptionConfirmationHtml(
  userName: string,
  plan: string,
  billingCycle?: string
): string {
  const planNames: Record<string, { name: string; emoji: string }> = {
    pro: { name: 'PRO ⚡', emoji: '⚡' },
    unicorn: { name: 'UNICORN 🦄', emoji: '🦄' },
    lifetime: { name: 'LIFETIME 💎', emoji: '💎' }
  };

  const planInfo = planNames[plan] || { name: plan.toUpperCase(), emoji: '🚀' };
  const cycleText = billingCycle
    ? `(facturación ${billingCycle === 'monthly' ? 'mensual' : billingCycle === 'quarterly' ? 'trimestral' : 'anual'})`
    : '(pago único)';

  const features = plan === 'pro'
    ? [
        'Clientes ilimitados',
        'Cotizaciones ilimitadas',
        'IA avanzada para cotizaciones',
        'Reportes financieros',
        'Analítica de ingresos',
        'Alertas inteligentes'
      ]
    : plan === 'unicorn'
    ? [
        'Todo lo de PRO',
        'Multi-usuario (hasta 3 miembros)',
        'Exportación a CRM',
        'Informes financieros Premium',
        'Soporte prioritario',
        'API de integración'
      ]
    : [
        'Todo lo de UNICORN',
        'Acceso de por vida',
        'Sin cargos recurrentes',
        'Todas las actualizaciones futuras',
        'Soporte VIP prioritario',
        'Descuentos en nuevos productos'
      ];

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">
        Bienvenido al Plan ${planInfo.name}
      </h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Hola <strong style="color:#111827;">${escapeHtml(userName)}</strong>,<br>
        Tu suscripción al plan <strong>${planInfo.name}</strong> ${cycleText} ha sido activada exitosamente.
      </p>
    </div>

    <!-- Features -->
    <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#059669;margin:0 0 16px 0;font-size:15px;font-weight:700;">
        ✨ Ahora tienes acceso a:
      </h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${features.map(f => `
          <tr>
            <td style="padding:4px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:20px;color:#10b981;font-size:14px;">✓</td>
                  <td style="font-size:14px;color:#374151;padding-left:8px;">${escapeHtml(f)}</td>
                </tr>
              </table>
            </td>
          </tr>
        `).join('')}
      </table>
    </div>

    ${buttonPrimary(APP_URL, 'Ir a Freelance Ledger')}

    ${divider()}

    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;line-height:1.6;">
      Si tienes alguna pregunta, responde a este correo o escríbenos a
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>.
      Estamos para ayudarte.
    </p>
  `);
}

// =============================================================================
// TEMPLATE: Recibo de Pago
// =============================================================================

export function paymentReceiptHtml(
  userName: string,
  plan: string,
  amount: number,
  transactionId: string,
  billingCycle?: string
): string {
  const cycleLabels: Record<string, string> = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    yearly: 'Anual'
  };

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🧾</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Recibo de Pago</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Hola <strong style="color:#111827;">${escapeHtml(userName)}</strong>,<br>
        Tu pago ha sido procesado exitosamente.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Plan</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827;font-size:14px;">${escapeHtml(plan.toUpperCase())}</td>
      </tr>
      ${billingCycle ? `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Ciclo</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827;font-size:14px;">${cycleLabels[billingCycle] || billingCycle}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Monto</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#059669;font-size:16px;">
          $${(amount / 100).toLocaleString('es-CO')} COP
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">ID Transacción</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;font-size:12px;color:#9ca3af;">${escapeHtml(transactionId)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:14px;">Fecha</td>
        <td style="padding:12px 16px;text-align:right;color:#111827;font-size:14px;">
          ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </td>
      </tr>
    </table>

    ${buttonPrimary(APP_URL + '/dashboard', 'Ir al Dashboard')}

    ${divider()}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;line-height:1.6;">
      Conserva este correo como comprobante de tu pago.<br>
      Si tienes preguntas, contáctanos en
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>
    </p>
  `);
}

// =============================================================================
// TEMPLATE: Confirmación de Registro / Bienvenida
// =============================================================================

export function welcomeEmailHtml(userName: string): string {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">👋</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">
        Bienvenido a Freelance Ledger
      </h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Hola <strong style="color:#111827;">${escapeHtml(userName)}</strong>,<br>
        Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte a bordo.
      </p>
    </div>

    <!-- Quick Start Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding-bottom:16px;">
          <table cellpadding="8" cellspacing="0">
            <tr>
              <td style="width:36px;height:36px;background:#f0fdf4;border-radius:50%;text-align:center;vertical-align:middle;">
                <span style="font-size:16px;">1</span>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;color:#374151;"><strong>Completa tu perfil</strong> &mdash; Agrega tu empresa y datos profesionales</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <table cellpadding="8" cellspacing="0">
            <tr>
              <td style="width:36px;height:36px;background:#f0fdf4;border-radius:50%;text-align:center;vertical-align:middle;">
                <span style="font-size:16px;">2</span>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;color:#374151;"><strong>Crea tu primer cliente</strong> &mdash; Organiza tu lista de clientes</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <table cellpadding="8" cellspacing="0">
            <tr>
              <td style="width:36px;height:36px;background:#f0fdf4;border-radius:50%;text-align:center;vertical-align:middle;">
                <span style="font-size:16px;">3</span>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;color:#374151;"><strong>Genera tu primera cotizaci&oacute;n</strong> &mdash; Usa la IA para cotizaciones inteligentes</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${buttonPrimary(APP_URL, 'Comenzar ahora')}

    ${divider()}

    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;line-height:1.6;">
      ¿Tienes dudas? Consulta nuestra gu&iacute;a o escr&iacute;benos a
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>
    </p>
  `);
}

// =============================================================================
// TEMPLATE: Activación de Trial Gratuito
// =============================================================================

export function trialActivationHtml(userName: string, trialEndDate: Date): string {
  const formattedDate = trialEndDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎁</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">
        Trial PRO Activado
      </h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Hola <strong style="color:#111827;">${escapeHtml(userName)}</strong>,<br>
        Tu prueba gratuita de <strong>7 días del plan PRO</strong> está activa.
      </p>
    </div>

    <div style="background:#fefce8;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="font-size:14px;color:#92400e;margin:0 0 8px 0;font-weight:600;">Tu trial expira el:</p>
      <p style="font-size:28px;font-weight:800;color:#d97706;margin:0;">${escapeHtml(formattedDate)}</p>
    </div>

    <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;line-height:1.6;">
      Disfruta de todas las funciones PRO sin restricciones. Al finalizar el período, puedes suscribirte para continuar disfrutando de los beneficios.
    </p>

    ${buttonPrimary(APP_URL, 'Explorar Freelance Ledger')}

    ${divider()}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;line-height:1.6;">
      No haremos cargos automáticos al finalizar tu trial.<br>
      ¿Preguntas? Escríbenos a
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>
    </p>
  `);
}

// =============================================================================
// TEMPLATE: Notificación de Downgrade
// =============================================================================

export function downgradeNotificationHtml(reason: string): string {
  const messages: Record<string, string> = {
    expired: 'Tu suscripción ha expirado y tu cuenta ha sido cambiada al plan Free.',
    trial_ended: 'Tu período de prueba ha finalizado y tu cuenta ha sido cambiada al plan Free.',
    payment_failed: 'No se pudo procesar el pago de tu suscripción. Tu cuenta ha sido cambiada al plan Free.',
    cancelled: 'Has cancelado tu suscripción. Ahora disfrutas del plan Free.'
  };

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">📋</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">
        Plan Actualizado
      </h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        ${messages[reason] || 'Tu plan ha sido actualizado.'}
      </p>
    </div>

    <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;line-height:1.6;">
      Aún puedes acceder a tus datos y funciones básicas con el plan Free. Si deseas reactivar tu suscripción, puedes hacerlo desde la plataforma.
    </p>

    ${buttonPrimary(APP_URL + '/checkout', 'Reactivar suscripción')}

    ${divider()}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;line-height:1.6;">
      ¿Tienes preguntas? Escríbenos a
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#059669;text-decoration:none;">${SUPPORT_EMAIL}</a>
    </p>
  `);
}

// =============================================================================
// DELIVERY FUNCTIONS
// =============================================================================

/**
 * Envía un email usando una Edge Function de Supabase
 * para mantener las credenciales SMTP seguras.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try Supabase Edge Function first
  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        html: options.html
      }
    });

    if (error) throw error;
    console.log('✅ Email sent to:', options.to);
    return true;
  } catch (fnError) {
    console.warn('⚠️ Edge Function not available, falling back to direct API...');
  }

  // Fallback: direct SMTP via API (only in dev)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Freelance Ledger <noreply@freelaissist.com>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Email send error:', errorData);
      return false;
    }

    console.log('✅ Email sent via Resend to:', options.to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Envía confirmación de suscripción/upgrade
 */
export async function sendSubscriptionConfirmation(
  email: string,
  userName: string,
  plan: string,
  billingCycle?: string
): Promise<boolean> {
  const html = subscriptionConfirmationHtml(userName, plan, billingCycle);
  return sendEmail({
    to: email,
    subject: `🎉 Bienvenido al plan ${plan.toUpperCase()} - Freelance Ledger`,
    html
  });
}

/**
 * Envía recibo de pago
 */
export async function sendPaymentReceipt(
  email: string,
  userName: string,
  plan: string,
  amount: number,
  transactionId: string,
  billingCycle?: string
): Promise<boolean> {
  const html = paymentReceiptHtml(userName, plan, amount, transactionId, billingCycle);
  return sendEmail({
    to: email,
    subject: '🧾 Recibo de pago - Freelance Ledger',
    html
  });
}

/**
 * Envía correo de bienvenida
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean> {
  const html = welcomeEmailHtml(userName);
  return sendEmail({
    to: email,
    subject: '👋 Bienvenido a Freelance Ledger',
    html
  });
}

/**
 * Envía notificación de activación de trial
 */
export async function sendTrialActivation(
  email: string,
  userName: string,
  trialEndDate: Date
): Promise<boolean> {
  const html = trialActivationHtml(userName, trialEndDate);
  return sendEmail({
    to: email,
    subject: '🎁 Trial PRO activado - Freelance Ledger',
    html
  });
}

/**
 * Envía notificación de downgrade/cambio de plan
 */
export async function sendDowngradeNotification(
  email: string,
  reason: string
): Promise<boolean> {
  const html = downgradeNotificationHtml(reason);
  return sendEmail({
    to: email,
    subject: '📋 Plan actualizado - Freelance Ledger',
    html
  });
}
