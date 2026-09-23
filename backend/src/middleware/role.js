const { ApiError } = require('../utils/apiResponse');

// Restricts a route to a set of roles. Backend is the source of truth for permissions -
// the frontend only hides UI, it never grants access on its own.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }
  next();
};

module.exports = { authorize };
