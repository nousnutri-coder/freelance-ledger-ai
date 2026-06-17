/**
 * =============================================================================
 * CONFIGURE SUPABASE AUTH EMAIL TEMPLATES
 * =============================================================================
 * Este script configura los templates de email HTML en Supabase Auth
 * con diseños profesionales y unificados.
 * =============================================================================
 */

import https from 'https';

const API_KEY = process.env.SUPABASE_SERVICE_KEY;
const PROJECT_REF = 'iicdtvhnilhgupckcfrn';

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      ...options,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Freelance Ledger</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px 16px;">
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
    <tr>
      <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04);">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding:32px 24px;">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 8px 0;line-height:1.6;">
          Freelance Ledger &mdash; Tu asistente financiero inteligente<br>
          &copy; ${new Date().getFullYear()} Freelance Ledger. Todos los derechos reservados.
        </p>
        <p style="font-size:11px;color:#d1d5db;margin:0;">
          Si no solicitaste este correo, ign&oacute;ralo. Si tienes dudas, escr&iacute;benos a soporte@freelaissist.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function confirmEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">📧</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Confirma tu correo</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Gracias por registrarte en <strong>Freelance Ledger</strong>. Para activar tu cuenta, confirma tu direcci&oacute;n de correo haciendo clic en el bot&oacute;n:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
        Confirmar mi cuenta
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
      Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br>
      <span style="color:#6b7280;word-break:break-all;">{{ .ConfirmationURL }}</span>
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;line-height:1.6;">
      &iquest;No creaste esta cuenta? Ignora este correo y no se realizar&aacute; ninguna acci&oacute;n.
    </p>
  `);
}

function recoveryEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔐</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Restablece tu contrase&ntilde;a</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Recibimos una solicitud para cambiar la contrase&ntilde;a de tu cuenta en <strong>Freelance Ledger</strong>. Haz clic en el bot&oacute;n para crear una nueva:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
        Restablecer contrase&ntilde;a
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
      Si el bot&oacute;n no funciona:<br>
      <span style="color:#6b7280;word-break:break-all;">{{ .ConfirmationURL }}</span>
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;line-height:1.6;">
      Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo y tu contrase&ntilde;a permanecer&aacute; igual.
    </p>
  `);
}

function emailChangeEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✉️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Cambio de correo</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Solicitaste cambiar el correo de tu cuenta de <strong>{{ .Email }}</strong> a <strong>{{ .NewEmail }}</strong>. Confirma el cambio:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
        Confirmar cambio
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
      Si el bot&oacute;n no funciona: <span style="color:#6b7280;word-break:break-all;">{{ .ConfirmationURL }}</span>
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;line-height:1.6;">
      Si no solicitaste este cambio, contacta a soporte inmediatamente.
    </p>
  `);
}

function magicLinkEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔗</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Inicia sesi&oacute;n</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Haz clic en el bot&oacute;n para iniciar sesi&oacute;n en <strong>Freelance Ledger</strong> sin necesidad de contrase&ntilde;a:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
        Iniciar sesi&oacute;n
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
      Si el bot&oacute;n no funciona: <span style="color:#6b7280;word-break:break-all;">{{ .ConfirmationURL }}</span>
    </p>
  `);
}

function inviteEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Has sido invitado</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Has sido invitado a unirte a <strong>Freelance Ledger</strong>. Acepta la invitaci&oacute;n y comienza a gestionar tus finanzas:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
        Aceptar invitaci&oacute;n
      </a>
    </div>
  `);
}

function reauthEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔑</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Verifica tu identidad</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Para continuar, ingresa el siguiente c&oacute;digo de verificaci&oacute;n en <strong>Freelance Ledger</strong>:
      </p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#f0fdf4;border:2px dashed #10b981;border-radius:16px;padding:20px 40px;">
        <span style="font-size:36px;font-weight:800;color:#059669;letter-spacing:8px;font-family:'Courier New',monospace;">{{ .Token }}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      Este c&oacute;digo expira en 1 hora. No lo compartas con nadie.
    </p>
  `);
}

function passwordChangedEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Contrase&ntilde;a actualizada</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        La contrase&ntilde;a de tu cuenta <strong>{{ .Email }}</strong> en Freelance Ledger ha sido cambiada exitosamente.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No hiciste este cambio?</strong> Contacta a nuestro equipo de soporte inmediatamente en <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>.
          </p>
        </td>
      </tr>
    </table>
  `);
}

function emailChangedEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✉️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Correo actualizado</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        El correo de tu cuenta en Freelance Ledger ha sido cambiado de <strong>{{ .OldEmail }}</strong> a <strong>{{ .Email }}</strong>.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No hiciste este cambio?</strong> Contacta a soporte: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

function phoneChangedEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">📱</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Tel&eacute;fono actualizado</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        El n&uacute;mero de tel&eacute;fono de tu cuenta <strong>{{ .Email }}</strong> ha sido cambiado de <strong>{{ .OldPhone }}</strong> a <strong>{{ .Phone }}</strong>.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No hiciste este cambio?</strong> Contacta a soporte inmediatamente: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

function mfaEnrolledEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔒</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Nuevo factor MFA</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Se ha registrado un nuevo factor de autenticaci&oacute;n ({{ .FactorType }}) para tu cuenta <strong>{{ .Email }}</strong> en Freelance Ledger.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No fuiste t&uacute;?</strong> Contacta a soporte inmediatamente: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

function mfaUnenrolledEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔓</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Factor MFA eliminado</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Se ha eliminado un factor de autenticaci&oacute;n ({{ .FactorType }}) de tu cuenta <strong>{{ .Email }}</strong> en Freelance Ledger.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No fuiste t&uacute;?</strong> Contacta a soporte inmediatamente: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

function identityLinkedEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔗</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Identidad vinculada</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Se ha vinculado una nueva identidad ({{ .Provider }}) a tu cuenta <strong>{{ .Email }}</strong> en Freelance Ledger.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No fuiste t&uacute;?</strong> Contacta a soporte: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

function identityUnlinkedEmail() {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">🔗</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Identidad desvinculada</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
        Se ha desvinculado la identidad ({{ .Provider }}) de tu cuenta <strong>{{ .Email }}</strong> en Freelance Ledger.
      </p>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 12px 0 0;">
          <span style="font-size:18px;">⚠️</span>
        </td>
        <td>
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
            <strong style="color:#111827;">&iquest;No fuiste t&uacute;?</strong> Contacta a soporte: <a href="mailto:soporte@freelaissist.com" style="color:#059669;">soporte@freelaissist.com</a>
          </p>
        </td>
      </tr>
    </table>
  `);
}

async function main() {
  const headers = { 'Authorization': `Bearer ${API_KEY}` };

  const config = {
    // Site URL
    site_url: 'https://freel.aissistpro.com',

    // Enable all security notifications
    mailer_notifications_password_changed_enabled: true,
    mailer_notifications_email_changed_enabled: true,
    mailer_notifications_phone_changed_enabled: true,
    mailer_notifications_mfa_factor_enrolled_enabled: true,
    mailer_notifications_mfa_factor_unenrolled_enabled: true,
    mailer_notifications_identity_linked_enabled: true,
    mailer_notifications_identity_unlinked_enabled: true,

    // Subjects (Spanish)
    mailer_subjects_confirmation: 'Bienvenido a Freelance Ledger — Confirma tu correo',
    mailer_subjects_recovery: 'Freelance Ledger — Restablece tu contraseña',
    mailer_subjects_email_change: 'Freelance Ledger — Confirma tu nuevo correo',
    mailer_subjects_magic_link: 'Freelance Ledger — Tu enlace mágico',
    mailer_subjects_invite: 'Has sido invitado a Freelance Ledger',
    mailer_subjects_reauthentication: 'Freelance Ledger — Código de verificación',
    mailer_subjects_password_changed_notification: 'Freelance Ledger — Contraseña actualizada',
    mailer_subjects_email_changed_notification: 'Freelance Ledger — Correo actualizado',
    mailer_subjects_phone_changed_notification: 'Freelance Ledger — Teléfono actualizado',
    mailer_subjects_mfa_factor_enrolled_notification: 'Freelance Ledger — Nuevo factor MFA activado',
    mailer_subjects_mfa_factor_unenrolled_notification: 'Freelance Ledger — Factor MFA eliminado',
    mailer_subjects_identity_linked_notification: 'Freelance Ledger — Nueva identidad vinculada',
    mailer_subjects_identity_unlinked_notification: 'Freelance Ledger — Identidad desvinculada',

    // Templates (beautiful HTML)
    mailer_templates_confirmation_content: confirmEmail(),
    mailer_templates_recovery_content: recoveryEmail(),
    mailer_templates_email_change_content: emailChangeEmail(),
    mailer_templates_magic_link_content: magicLinkEmail(),
    mailer_templates_invite_content: inviteEmail(),
    mailer_templates_reauthentication_content: reauthEmail(),
    mailer_templates_password_changed_notification_content: passwordChangedEmail(),
    mailer_templates_email_changed_notification_content: emailChangedEmail(),
    mailer_templates_phone_changed_notification_content: phoneChangedEmail(),
    mailer_templates_mfa_factor_enrolled_notification_content: mfaEnrolledEmail(),
    mailer_templates_mfa_factor_unenrolled_notification_content: mfaUnenrolledEmail(),
    mailer_templates_identity_linked_notification_content: identityLinkedEmail(),
    mailer_templates_identity_unlinked_notification_content: identityUnlinkedEmail(),
  };

  console.log('📤 Sending email templates to Supabase...');
  const r = await req({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/config/auth`,
    method: 'PATCH',
    headers
  }, JSON.stringify(config));

  if (r.status === 200) {
    console.log('✅ All templates updated successfully!\n');
    console.log('--- Subjects set ---');
    const subjects = [
      'confirmation', 'recovery', 'email_change', 'magic_link', 'invite',
      'reauthentication', 'password_changed_notification', 'email_changed_notification',
      'phone_changed_notification', 'mfa_factor_enrolled_notification',
      'mfa_factor_unenrolled_notification', 'identity_linked_notification',
      'identity_unlinked_notification'
    ];
    for (const s of subjects) {
      console.log(`  📧 ${r.data['mailer_subjects_' + s]}`);
    }
    console.log('\n✅ SMTP: Gmail (smtp.gmail.com:587)');
    console.log('✅ Sender: Freelance Ledger <aissistpro9@gmail.com>');
    console.log('✅ Site URL: https://freel.aissistpro.com');
  } else {
    console.log('❌ Error:', r.status, JSON.stringify(r.data).slice(0, 500));
  }
}

main().catch(console.error);
