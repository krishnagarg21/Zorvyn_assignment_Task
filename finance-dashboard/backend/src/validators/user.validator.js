const { body } = require('express-validator');
const { ROLE_LIST } = require('../constants/roles');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(ROLE_LIST)
    .withMessage(`Role must be one of: ${ROLE_LIST.join(', ')}`),
];

const updateUserValidator = [
  body('role')
    .optional()
    .isIn(ROLE_LIST)
    .withMessage(`Role must be one of: ${ROLE_LIST.join(', ')}`),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
];

module.exports = { createUserValidator, updateUserValidator };
