const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');
const User = require('../models/User.model');

/**
 * JWT authentication middleware.
 * Extracts the Bearer token from the Authorization header, verifies it,
 * fetches the user from the database, and attaches it to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please login again.');
      }
      return sendError(res, 401, 'Invalid token. Please login again.');
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendError(res, 401, 'User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Contact an administrator.');
    }

    // Attach user to request for downstream middleware and controllers
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
