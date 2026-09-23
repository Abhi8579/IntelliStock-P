const { ApiError } = require('../utils/apiResponse');

// Runs a validator function (returns {valid, errors}) and short-circuits with 422 if invalid.
const validate = (validatorFn) => (req, res, next) => {
  const { valid, errors } = validatorFn(req.body);
  if (!valid) {
    throw new ApiError(422, 'Validation failed.', errors);
  }
  next();
};

module.exports = { validate };
