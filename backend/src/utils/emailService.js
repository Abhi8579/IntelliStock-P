const nodemailer = require('nodemailer');

let transporter = null;
let warnedMissingConfig = false;

// Lazily builds the SMTP transporter from env vars. If SMTP isn't configured
// (e.g. local development without a mail server), we log the email instead of
// throwing - this keeps the OTP flow testable without real SMTP credentials.
const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
};

const send = async ({ to, subject, html, text }) => {
  const from = process.env.SMTP_FROM || 'IntelliStock Pro <no-reply@intellistock.local>';
  const t = getTransporter();

  if (!t) {
    if (!warnedMissingConfig) {
      console.warn('\n⚠️  SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD missing in .env).');
      console.warn('    Emails will be printed to this console instead of being sent.\n');
      warnedMissingConfig = true;
    }
    console.log(`\n----- [DEV EMAIL] -----\nTo: ${to}\nSubject: ${subject}\n${text}\n------------------------\n`);
    return { delivered: false, devMode: true };
  }

  await t.sendMail({ from, to, subject, html, text });
  return { delivered: true, devMode: false };
};

const otpEmailBody = (otp, purposeLabel, expiryMinutes) => `
  <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
    <h2 style="color:#17171a">IntelliStock Pro</h2>
    <p>Your one-time verification code for <strong>${purposeLabel}</strong> is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:4px;background:#f5f5f3;padding:12px 16px;border-radius:8px;text-align:center">${otp}</p>
    <p style="color:#666;font-size:13px">This code expires in ${expiryMinutes} minutes. If you did not request this, you can safely ignore this email.</p>
  </div>
`;

const sendOtpEmail = ({ to, otp, purpose, expiryMinutes }) => {
  const purposeLabel = purpose === 'FIRST_ADMIN_SETUP' ? 'creating your Admin account' : 'resetting your password';
  return send({
    to,
    subject: `Your IntelliStock Pro verification code: ${otp}`,
    html: otpEmailBody(otp, purposeLabel, expiryMinutes),
    text: `Your IntelliStock Pro verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
  });
};

const sendAccountCreatedEmail = ({ to, name, role, tempPassword, loginUrl }) => send({
  to,
  subject: 'Your IntelliStock Pro account has been created',
  html: `
    <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
      <h2 style="color:#17171a">Welcome to IntelliStock Pro, ${name}</h2>
      <p>An administrator has created an account for you with the role <strong>${role}</strong>.</p>
      <p><strong>Email:</strong> ${to}<br/><strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password as soon as possible.</p>
      ${loginUrl ? `<p><a href="${loginUrl}">Log in to IntelliStock Pro</a></p>` : ''}
    </div>
  `,
  text: `Welcome to IntelliStock Pro, ${name}. Your account (${role}) has been created. Email: ${to} / Temporary password: ${tempPassword}. Please log in and change your password soon.`,
});

module.exports = { sendOtpEmail, sendAccountCreatedEmail };
