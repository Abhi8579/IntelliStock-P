const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { sanitizeUser } = require('../services/authService');
const { sendAccountCreatedEmail } = require('../utils/emailService');
const { logActivity } = require('../utils/activityLogger');

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  sendSuccess(res, 200, 'Users fetched.', users.map(sanitizeUser));
});

// Admin-only. Role is restricted to STAFF/MANAGER at the validator level -
// there is no code path here that can produce another ADMIN account, which
// is what prevents privilege escalation via this endpoint.
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, tempPassword } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, password: passwordHash, role },
  });

  await sendAccountCreatedEmail({
    to: normalizedEmail,
    name: user.name,
    role: user.role,
    tempPassword,
    loginUrl: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login` : undefined,
  });

  await logActivity({
    userId: req.user.id,
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    description: `${req.user.name} created a new ${role} account for ${user.name} (${user.email}).`,
  });

  // Never echo the temporary password back in the API response.
  sendSuccess(res, 201, 'Employee account created. Login details have been emailed to them.', sanitizeUser(user));
});

// Admin cannot deactivate their own account, and cannot deactivate the last
// remaining active Admin - both would be an accidental self-lockout.
const setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw new ApiError(404, 'User not found.');

  if (target.id === req.user.id && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account.');
  }

  if (target.role === 'ADMIN' && isActive === false) {
    const activeAdmins = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
    if (activeAdmins <= 1) throw new ApiError(400, 'Cannot deactivate the only remaining Admin account.');
  }

  const updated = await prisma.user.update({ where: { id: target.id }, data: { isActive: !!isActive } });

  await logActivity({
    userId: req.user.id,
    action: 'UPDATE',
    entity: 'User',
    entityId: updated.id,
    description: `${req.user.name} ${isActive ? 'activated' : 'deactivated'} the account of ${updated.name} (${updated.email}).`,
  });

  sendSuccess(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully.`, sanitizeUser(updated));
});

module.exports = { getUsers, createUser, setUserStatus };
