const { ApiError } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler. Never leaks stack traces or raw DB errors to the client.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our end.';
  let errors = err.errors || null;

  // Prisma known error codes
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
    message = `A record with this ${field || 'value'} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested record was not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'This action references a record that does not exist.';
  }

  if (process.env.NODE_ENV === 'development' && !err.statusCode && !err.code) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = { notFound, errorHandler };
