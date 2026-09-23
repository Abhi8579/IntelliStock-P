class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }
}
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};
module.exports = { ApiError, sendSuccess };
