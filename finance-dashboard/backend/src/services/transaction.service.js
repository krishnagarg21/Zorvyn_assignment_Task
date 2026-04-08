const Transaction = require('../models/Transaction.model');

/**
 * Transaction service — handles all transaction CRUD and query logic.
 */

/**
 * Create a new transaction.
 * @param {object} data - Transaction data including userId
 * @returns {Promise<object>} Created transaction
 */
const createTransaction = async (data) => {
  const transaction = await Transaction.create(data);
  return transaction;
};

/**
 * List transactions with filters and pagination.
 * Soft-deleted records are excluded unless the caller is Admin and explicitly includes them.
 *
 * @param {object} options - { type, category, startDate, endDate, page, limit, includeDeleted, userRole }
 * @returns {Promise<{ transactions: Array, total: number, page: number, limit: number }>}
 */
const listTransactions = async ({
  type,
  category,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  includeDeleted = false,
  userRole,
}) => {
  const filter = {};

  // Only Admin can see soft-deleted records, and only when explicitly requested
  if (includeDeleted && userRole === 'ADMIN') {
    // No isDeleted filter — show everything
  } else {
    filter.isDeleted = false;
  }

  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return { transactions, total, page, limit };
};

/**
 * Get a single transaction by ID.
 * @param {string} transactionId
 * @returns {Promise<object>}
 * @throws {Error} If not found
 */
const getTransactionById = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId).populate('userId', 'name email');

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Update a transaction by ID.
 * @param {string} transactionId
 * @param {object} updates
 * @returns {Promise<object>} Updated transaction
 * @throws {Error} If not found
 */
const updateTransaction = async (transactionId, updates) => {
  const allowedFields = ['amount', 'type', 'category', 'date', 'notes'];
  const sanitizedUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, isDeleted: false },
    sanitizedUpdates,
    { new: true, runValidators: true }
  ).populate('userId', 'name email');

  if (!transaction) {
    const error = new Error('Transaction not found or has been deleted');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Soft delete a transaction (set isDeleted to true).
 * @param {string} transactionId
 * @returns {Promise<object>} Deleted transaction
 * @throws {Error} If not found
 */
const softDeleteTransaction = async (transactionId) => {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    { isDeleted: true },
    { new: true }
  );

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

module.exports = {
  createTransaction,
  listTransactions,
  getTransactionById,
  updateTransaction,
  softDeleteTransaction,
};
