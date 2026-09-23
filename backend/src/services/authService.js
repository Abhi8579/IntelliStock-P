const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/apiResponse');
const otpService = require('./otpService');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notify');

const PASSWORD_MIN_LENGTH = 8;

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, tv: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => {
  const { password, tokenVersion, ...safe } = user;
  return safe;
};

const assertStrongPassword = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new ApiError(422, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(422, 'Password must contain both letters and numbers.');
  }
};

// ---------- First admin setup (two-step, OTP-gated) ----------

const hasAnyUser = async () => (await prisma.user.count()) > 0;

const requestFirstAdminOtp = async ({ name, email, password, confirmPassword }) => {
  if (await hasAnyUser()) {
    throw new ApiError(403, 'Setup has already been completed. Please log in instead.');
  }
  if (!name || name.trim().length < 2) throw new ApiError(422, 'Name must be at least 2 characters.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(422, 'A valid email is required.');
  if (password !== confirmPassword) throw new ApiError(422, 'Passwords do not match.');
  assertStrongPassword(password);

  const passwordHash = await bcrypt.hash(password, 10);
  await otpService.requestOtp({
    email,
    purpose: 'FIRST_ADMIN_SETUP',
    payload: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash },
  });
};

const verifyFirstAdminOtp = async ({ email, otp }) => {
  if (await hasAnyUser()) {
    throw new ApiError(403, 'Setup has already been completed. Please log in instead.');
  }
  const payload = await otpService.verifyOtp({ email, purpose: 'FIRST_ADMIN_SETUP', otp });
  if (!payload) throw new ApiError(400, 'Verification session expired. Please start over.');

  const user = await prisma.user.create({
    data: { name: payload.name, email: payload.email, password: payload.passwordHash, role: 'ADMIN' },
  });

  await logActivity({ userId: user.id, action: 'CREATE', entity: 'User', entityId: user.id, description: `${user.name} completed initial setup as the first Admin.` });

  return { user: sanitizeUser(user), token: signToken(user) };
};

// ---------- Login ----------

const login = async ({ email, password }) => {
  if (!(await hasAnyUser())) {
    throw new ApiError(400, 'No account exists yet. Please complete the initial setup first.');
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid email or password.');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Invalid email or password.');

  return { user: sanitizeUser(user), token: signToken(user) };
};

// ---------- Forgot password (all roles) ----------

const requestPasswordResetOtp = async ({ email }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = normalizedEmail ? await prisma.user.findUnique({ where: { email: normalizedEmail } }) : null;

  // Always behave identically whether or not the account exists, so the
  // response can never be used to enumerate registered emails.
  if (user && user.isActive) {
    await otpService.requestOtp({ email: normalizedEmail, purpose: 'PASSWORD_RESET', payload: { userId: user.id } });
  }
};

const verifyPasswordResetOtp = async ({ email, otp }) => {
  const payload = await otpService.verifyOtp({ email, purpose: 'PASSWORD_RESET', otp });
  if (!payload) throw new ApiError(400, 'Verification session expired. Please start over.');

  // Short-lived, single-purpose token authorizing only the password reset step.
  const resetToken = jwt.sign({ userId: payload.userId, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });
  return { resetToken };
};

const resetPassword = async ({ resetToken, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) throw new ApiError(422, 'Passwords do not match.');
  assertStrongPassword(newPassword);

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(400, 'This reset session has expired. Please request a new code.');
  }
  if (decoded.purpose !== 'password_reset') throw new ApiError(400, 'Invalid reset session.');

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new ApiError(404, 'Account not found.');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash, tokenVersion: { increment: 1 } }, // invalidates all existing sessions
  });

  await logActivity({ userId: updated.id, action: 'PASSWORD_RESET', entity: 'User', entityId: updated.id, description: `${updated.name} (${updated.email}) reset their password.` });

  if (updated.role !== 'ADMIN') {
    await createNotification({
      type: 'PASSWORD_RESET',
      title: 'Password Reset',
      message: `${updated.name} (${updated.email}) successfully reset their password.`,
      audienceRole: 'ADMIN',
    });
  }

  return true;
};

module.exports = {
  signToken,
  sanitizeUser,
  hasAnyUser,
  requestFirstAdminOtp,
  verifyFirstAdminOtp,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  assertStrongPassword,
};
