const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/users
 * @desc    List all users with pagination
 * @access  Admin
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const { users, total } = await userService.listUsers({ page, limit });

  return sendSuccess(res, 200, 'Users fetched successfully', users, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/users/me
 * @desc    Get own profile
 * @access  All roles
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.userId);
  return sendSuccess(res, 200, 'Profile fetched successfully', user);
});

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User fetched successfully', user);
});

/**
 * @route   POST /api/users
 * @desc    Create a user with specific role
 * @access  Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await userService.createUser({ name, email, password, role });
  return sendSuccess(res, 201, 'User created successfully', user);
});

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user role or status
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return sendSuccess(res, 200, 'User updated successfully', user);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft-deactivate user (isActive: false)
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id);
  return sendSuccess(res, 200, 'User deactivated successfully', user);
});

module.exports = { listUsers, getMe, getUser, createUser, updateUser, deleteUser };
