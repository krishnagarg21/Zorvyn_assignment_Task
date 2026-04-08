const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Auth service — encapsulates authentication business logic.
 * Controllers never touch models directly; they call these methods.
 */

/**
 * Register a new user.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} Created user (without password)
 * @throws {Error} If email already exists
 */
const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  return user;
};

/**
 * Authenticate a user and return a signed JWT.
 * @param {object} credentials - { email, password }
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {Error} If credentials are invalid or account is deactivated
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return { user, token };
};

/**
 * Generate a signed JWT for the given user.
 * @param {object} user - Mongoose user document
 * @returns {string} Signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { registerUser, loginUser, generateToken };
