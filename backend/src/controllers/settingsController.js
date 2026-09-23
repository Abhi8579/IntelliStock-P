const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { assertStrongPassword, signToken, sanitizeUser } = require('../services/authService');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notify');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.settings.findUnique({ where: { id: '1' } });
  if (!settings) settings = await prisma.settings.create({ data: { id: '1' } });
  sendSuccess(res, 200, 'Settings fetched.', settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: '1' },
    update: req.body,
    create: { id: '1', ...req.body },
  });
  sendSuccess(res, 200, 'Settings updated.', settings);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { name, avatar } });
  const { password, ...safe } = user;
  sendSuccess(res, 200, 'Profile updated successfully.', safe);
});

// Voluntary in-app password change (user knows their current password).
// Distinct from the forgot-password/OTP flow, but shares the same strength
// rule and also bumps tokenVersion so any other open sessions are signed out.
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  assertStrongPassword(newPassword);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const match = await bcrypt.compare(currentPassword || '', user.password);
  if (!match) throw new ApiError(401, 'Current password is incorrect.');

  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed, tokenVersion: { increment: 1 } },
  });

  await logActivity({ userId: updated.id, action: 'PASSWORD_RESET', entity: 'User', entityId: updated.id, description: `${updated.name} (${updated.email}) changed their password.` });

  if (updated.role !== 'ADMIN') {
    await createNotification({
      type: 'PASSWORD_RESET',
      title: 'Password Reset',
      message: `${updated.name} (${updated.email}) successfully reset their password.`,
      audienceRole: 'ADMIN',
    });
  }

  // Re-issue a token for this session (its tokenVersion changed too), so the
  // user making the change isn't immediately logged out by their own action.
  const token = signToken(updated);
  sendSuccess(res, 200, 'Password changed successfully.', { user: sanitizeUser(updated), token });
});

module.exports = { getSettings, updateSettings, updateProfile, changePassword };
