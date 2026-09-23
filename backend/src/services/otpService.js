const prisma = require('../config/prisma');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/emailService');
const { ApiError } = require('../utils/apiResponse');

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
const MAX_ATTEMPTS = 5;

// Creates a fresh OTP for (email, purpose), invalidating any previous
// unconsumed OTPs for the same pair so only the latest code is ever valid.
// `payload` (for FIRST_ADMIN_SETUP) carries the pending signup data as JSON
// and is only materialized into a real User once the OTP is verified.
const requestOtp = async ({ email, purpose, payload }) => {
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.otpToken.updateMany({
    where: { email: normalizedEmail, purpose, consumedAt: null, invalidatedAt: null },
    data: { invalidatedAt: new Date() },
  });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpToken.create({
    data: {
      email: normalizedEmail,
      otpHash,
      purpose,
      payload: payload ? JSON.stringify(payload) : null,
      maxAttempts: MAX_ATTEMPTS,
      expiresAt,
    },
  });

  // Never log or return the raw OTP anywhere except the email itself.
  await sendOtpEmail({ to: normalizedEmail, otp, purpose, expiryMinutes: OTP_EXPIRY_MINUTES });
};

// Verifies an OTP. On success, marks it consumed and returns its parsed payload.
// Throws a generic "Invalid or expired code" error in every failure case so
// timing/response differences can't be used to enumerate accounts or codes.
const verifyOtp = async ({ email, purpose, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await prisma.otpToken.findFirst({
    where: { email: normalizedEmail, purpose, consumedAt: null, invalidatedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const genericError = () => new ApiError(400, 'Invalid or expired verification code.');

  if (!record) throw genericError();
  if (record.expiresAt < new Date()) throw genericError();
  if (record.attempts >= record.maxAttempts) {
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new code.');
  }

  const match = await compareOtp(otp, record.otpHash);
  if (!match) {
    await prisma.otpToken.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    const remaining = record.maxAttempts - (record.attempts + 1);
    if (remaining <= 0) throw new ApiError(429, 'Too many incorrect attempts. Please request a new code.');
    throw new ApiError(400, `Invalid or expired verification code. ${remaining} attempt(s) remaining.`);
  }

  await prisma.otpToken.update({ where: { id: record.id }, data: { verifiedAt: new Date(), consumedAt: new Date() } });

  return record.payload ? JSON.parse(record.payload) : null;
};

module.exports = { requestOtp, verifyOtp };
