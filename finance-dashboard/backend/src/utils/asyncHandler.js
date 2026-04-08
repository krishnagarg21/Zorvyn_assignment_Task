/**
 * Wraps an async Express route handler to forward errors to the global error handler.
 * Eliminates repetitive try/catch blocks in every controller method.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
