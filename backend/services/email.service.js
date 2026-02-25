/**
 * Email notifications via Firebase Auth custom emails or (optionally) Nodemailer.
 *
 * Firebase handles email-verification emails natively.
 * This service sends transactional notifications (e.g. "Grant ID generated").
 *
 * Add SMTP_* vars to .env to enable Nodemailer delivery; without them the
 * module falls back to console-logging the email (useful in dev).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  // Lazy-require nodemailer only when SMTP is configured
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Send a transactional email.
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL] (no SMTP configured) → ${to} | ${subject}`);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || `"Fund Tracker" <no-reply@fundtracker.app>`,
    to,
    subject,
    html,
  });
}

/**
 * Notify user that their Grant ID has been generated.
 */
async function notifyGrantIdGenerated({ to, fullName, grantId, regId }) {
  await sendMail({
    to,
    subject: `Your Grant ID: ${grantId}`,
    html: `
      <p>Dear ${fullName || 'User'},</p>
      <p>Your Activity/Grant ID has been generated successfully.</p>
      <table>
        <tr><td><b>Registration ID</b></td><td>${regId}</td></tr>
        <tr><td><b>Grant ID</b></td><td><b>${grantId}</b></td></tr>
      </table>
      <p>Please keep this ID for future reference when submitting grant requests.</p>
      <p>Regards,<br/>Fund Tracking Portal</p>
    `,
  });
}

/**
 * Notify user that their grant request status changed.
 */
async function notifyRequestStatus({ to, fullName, grantId, status, step, remarks }) {
  await sendMail({
    to,
    subject: `Grant Request Update – ${grantId} | ${status}`,
    html: `
      <p>Dear ${fullName || 'User'},</p>
      <p>Your grant request for <b>${grantId}</b> has been <b>${status}</b> by ${step}.</p>
      ${remarks ? `<p>Remarks: ${remarks}</p>` : ''}
      <p>Regards,<br/>Fund Tracking Portal</p>
    `,
  });
}

module.exports = { sendMail, notifyGrantIdGenerated, notifyRequestStatus };
