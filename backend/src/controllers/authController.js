const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const authService = require('../services/authService');
const { logActivity } = require('../utils/activityLogger');
const prisma = require('../config/prisma');

// Lets the frontend decide whether to show "Create Admin Account" (fresh
// install) or the normal Login / Forgot Password screens.
const getSetupStatus = asyncHandler(async (req, res) => {
  const hasAdmin = await authService.hasAnyUser();
  sendSuccess(res, 200, 'Setup status fetched.', { hasAdmin });
});

// Step 1 of first-run setup: validate + stash the pending admin's details and
// email them an OTP. No user is created yet.
const requestFirstAdminOtp = asyncHandler(async (req, res) => {
  await authService.requestFirstAdminOtp(req.body);
  sendSuccess(res, 200, 'A verification code has been sent to your email.');
});

// Step 2: verifying the OTP is what actually creates the ADMIN account.
const verifyFirstAdminOtp = asyncHandler(async (req, res) => {
  const { user, token } = await authService.verifyFirstAdminOtp(req.body);
  sendSuccess(res, 201, 'Admin account created successfully.', { user, token });
});

// Public self-registration is intentionally disabled once an Admin exists.
// This endpoint exists so a direct API request gets an explicit, enforced
// rejection rather than a 404 - the backend is the source of truth, not the UI.
const registerDisabled = asyncHandler(async (req, res) => {
  const hasAdmin = await authService.hasAnyUser();
  if (!hasAdmin) {
    throw new ApiError(400, 'No account exists yet. Use /api/auth/setup/request-otp to create the first Admin account.');
  }
  throw new ApiError(403, 'Public registration is disabled. Please contact your administrator to request an account.');
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  await logActivity({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, description: `${user.name} logged in.` });
  sendSuccess(res, 200, 'Logged in successfully.', { user, token });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new ApiError(404, 'User not found.');
  sendSuccess(res, 200, 'User fetched.', { user: authService.sanitizeUser(user) });
});

// ---- Forgot password (all roles) ----

const requestPasswordResetOtp = asyncHandler(async (req, res) => {
  await authService.requestPasswordResetOtp(req.body);
  // Deliberately generic: never reveals whether the email is registered.
  sendSuccess(res, 200, 'If an account exists with this email, a verification code has been sent.');
});

const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { resetToken } = await authService.verifyPasswordResetOtp(req.body);
  sendSuccess(res, 200, 'Code verified. You can now set a new password.', { resetToken });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, 200, 'Password reset successfully. Please log in with your new password.');
});

module.exports = {
  getSetupStatus,
  requestFirstAdminOtp,
  verifyFirstAdminOtp,
  registerDisabled,
  login,
  me,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
};
