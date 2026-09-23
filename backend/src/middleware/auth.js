const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiResponse');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Verifies JWT, loads the user, and attaches it to req.user. Rejects if
// missing/invalid/inactive, or if the token was issued before the user's
// last password reset (tokenVersion mismatch) - this is what lets a
// password reset revoke every previously-issued session.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated.');
  }
  if (typeof decoded.tv === 'number' && decoded.tv !== user.tokenVersion) {
    throw new ApiError(401, 'Your session is no longer valid. Please log in again.');
  }

  req.user = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  next();
});

module.exports = { protect };
