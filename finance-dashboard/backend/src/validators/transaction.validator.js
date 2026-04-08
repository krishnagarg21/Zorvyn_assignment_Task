const { body } = require('express-validator');
const { TRANSACTION_TYPES } = require('../models/Transaction.model');

const createTransactionValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const updateTransactionValidator = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

module.exports = { createTransactionValidator, updateTransactionValidator };
