const transactionService = require('../services/transaction.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/transactions
 * @desc    Create a transaction
 * @access  Admin, Analyst
 */
const createTransaction = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    userId: req.user.userId,
  };

  const transaction = await transactionService.createTransaction(data);
  return sendSuccess(res, 201, 'Transaction created successfully', transaction);
});

/**
 * @route   GET /api/transactions
 * @desc    List transactions with filters and pagination
 * @access  All roles
 */
const listTransactions = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    startDate,
    endDate,
    includeDeleted,
    page: pageStr,
    limit: limitStr,
  } = req.query;

  const page = parseInt(pageStr, 10) || 1;
  const limit = parseInt(limitStr, 10) || 10;

  const { transactions, total } = await transactionService.listTransactions({
    type,
    category,
    startDate,
    endDate,
    page,
    limit,
    includeDeleted: includeDeleted === 'true',
    userRole: req.user.role,
  });

  return sendSuccess(res, 200, 'Transactions fetched successfully', transactions, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction
 * @access  All roles
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  return sendSuccess(res, 200, 'Transaction fetched successfully', transaction);
});

/**
 * @route   PATCH /api/transactions/:id
 * @desc    Update a transaction
 * @access  Admin, Analyst
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.params.id, req.body);
  return sendSuccess(res, 200, 'Transaction updated successfully', transaction);
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Soft delete a transaction
 * @access  Admin only
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.softDeleteTransaction(req.params.id);
  return sendSuccess(res, 200, 'Transaction deleted successfully', transaction);
});

module.exports = {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
