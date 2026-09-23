const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// 6-digit numeric OTP, generated with crypto (not Math.random) for unpredictability.
const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const hashOtp = (otp) => bcrypt.hash(otp, 10);
const compareOtp = (otp, hash) => bcrypt.compare(otp, hash);

module.exports = { generateOtp, hashOtp, compareOtp };
