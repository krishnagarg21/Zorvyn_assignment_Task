const User = require('../models/User.model');

/**
 * User service — handles all user CRUD operations.
 */

/**
 * List users with pagination.
 * @param {object} options - { page, limit }
 * @returns {Promise<{ users: Array, total: number, page: number, limit: number }>}
 */
const listUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return { users, total, page, limit };
};

/**
 * Get a single user by ID.
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {Error} If user not found
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Create a new user (admin operation — allows setting role).
 * @param {object} userData - { name, email, password, role }
 * @returns {Promise<object>}
 * @throws {Error} If email already exists
 */
const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, role });
  return user;
};

/**
 * Update a user's role, status, or name.
 * @param {string} userId
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated user
 * @throws {Error} If user not found
 */
const updateUser = async (userId, updates) => {
  const allowedFields = ['role', 'isActive', 'name'];
  const sanitizedUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Soft deactivate a user (set isActive to false).
 * @param {string} userId
 * @returns {Promise<object>} Deactivated user
 * @throws {Error} If user not found
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = { listUsers, getUserById, createUser, updateUser, deactivateUser };
