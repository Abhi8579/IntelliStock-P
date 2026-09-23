const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v || '');

const validateFirstAdminRequest = (body) => {
  const errors = {};
  if (!body.name || body.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!isEmail(body.email)) errors.email = 'A valid email is required.';
  if (!body.password || body.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[A-Za-z]/.test(body.password) || !/[0-9]/.test(body.password)) errors.password = 'Password must contain both letters and numbers.';
  if (body.password !== body.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return { valid: Object.keys(errors).length === 0, errors };
};

const validateOtpVerify = (body) => {
  const errors = {};
  if (!isEmail(body.email)) errors.email = 'A valid email is required.';
  if (!body.otp || !/^\d{6}$/.test(body.otp)) errors.otp = 'Enter the 6-digit code.';
  return { valid: Object.keys(errors).length === 0, errors };
};

const validateLogin = (body) => {
  const errors = {};
  if (!body.email) errors.email = 'Email is required.';
  if (!body.password) errors.password = 'Password is required.';
  return { valid: Object.keys(errors).length === 0, errors };
};

const validateForgotPasswordRequest = (body) => {
  const errors = {};
  if (!isEmail(body.email)) errors.email = 'A valid email is required.';
  return { valid: Object.keys(errors).length === 0, errors };
};

const validateResetPassword = (body) => {
  const errors = {};
  if (!body.resetToken) errors.resetToken = 'Reset session is missing. Please start over.';
  if (!body.newPassword || body.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.';
  else if (!/[A-Za-z]/.test(body.newPassword) || !/[0-9]/.test(body.newPassword)) errors.newPassword = 'Password must contain both letters and numbers.';
  if (body.newPassword !== body.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return { valid: Object.keys(errors).length === 0, errors };
};

const validateCreateUser = (body) => {
  const errors = {};
  if (!body.name || body.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!isEmail(body.email)) errors.email = 'A valid email is required.';
  if (!['STAFF', 'MANAGER'].includes(body.role)) errors.role = 'Role must be Staff or Manager.';
  if (!body.tempPassword || body.tempPassword.length < 8) errors.tempPassword = 'Temporary password must be at least 8 characters.';
  return { valid: Object.keys(errors).length === 0, errors };
};

module.exports = {
  validateFirstAdminRequest,
  validateOtpVerify,
  validateLogin,
  validateForgotPasswordRequest,
  validateResetPassword,
  validateCreateUser,
};
