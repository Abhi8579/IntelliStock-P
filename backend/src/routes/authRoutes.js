const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  validateFirstAdminRequest, validateOtpVerify, validateLogin,
  validateForgotPasswordRequest, validateResetPassword,
} = require('../validators/authValidator');

// Fresh-install status check (frontend uses this to route to setup vs login)
router.get('/setup-status', ctrl.getSetupStatus);

// First admin, OTP-gated, two-step
router.post('/setup/request-otp', validate(validateFirstAdminRequest), ctrl.requestFirstAdminOtp);
router.post('/setup/verify-otp', validate(validateOtpVerify), ctrl.verifyFirstAdminOtp);

// Public self-registration is disabled once an Admin exists - enforced here, not just hidden in the UI
router.post('/register', ctrl.registerDisabled);

router.post('/login', validate(validateLogin), ctrl.login);
router.get('/me', protect, ctrl.me);

// Forgot password, OTP-gated, all roles
router.post('/forgot-password/request-otp', validate(validateForgotPasswordRequest), ctrl.requestPasswordResetOtp);
router.post('/forgot-password/verify-otp', validate(validateOtpVerify), ctrl.verifyPasswordResetOtp);
router.post('/forgot-password/reset', validate(validateResetPassword), ctrl.resetPassword);

module.exports = router;
