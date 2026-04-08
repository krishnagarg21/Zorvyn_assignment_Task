const { sendError } = require('../utils/apiResponse');

/**
 * Role-based access control middleware factory.
 * Returns a middleware that checks if `req.user.role` is in the allowed list.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin-only', authenticate, authorizeRoles('ADMIN'), controller);
 * router.get('/analysts', authenticate, authorizeRoles('ANALYST', 'ADMIN'), controller);
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
      );
    }

    return next();
  };
};

module.exports = authorizeRoles;
