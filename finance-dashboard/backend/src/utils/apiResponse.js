/**
 * Standardized API response utilities.
 * Every endpoint must use these helpers to maintain a consistent response envelope.
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {*} data - Response payload
 * @param {object} [meta] - Optional pagination / metadata
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status (400, 401, 403, 404, 500)
 * @param {string} message - Human-readable error message
 * @param {Array} [errors] - Optional field-level validation errors
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
