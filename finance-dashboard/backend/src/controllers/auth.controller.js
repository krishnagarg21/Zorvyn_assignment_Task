const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (default role: VIEWER)
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await authService.registerUser({ name, email, password });
  const { token } = await authService.loginUser({ email, password });

  return sendSuccess(res, 201, 'User registered successfully', {
    user,
    token,
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login and return JWT
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  return sendSuccess(res, 200, 'Login successful', {
    user,
    token,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token clear)
 * @access  Private
 */
const logout = asyncHandler(async (_req, res) => {
  // JWT is stateless — client is responsible for clearing the token.
  // In a production system, we would add the token to a blacklist (Redis).
  return sendSuccess(res, 200, 'Logged out successfully');
});

module.exports = { register, login, logout };
