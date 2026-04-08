const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { createTransactionValidator, updateTransactionValidator } = require('../validators/transaction.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// All roles can read
router.get('/', transactionController.listTransactions);
router.get('/:id', transactionController.getTransaction);

// Analyst + Admin can create and update
router.post(
  '/',
  authorizeRoles(ROLES.ANALYST, ROLES.ADMIN),
  createTransactionValidator,
  validate,
  transactionController.createTransaction
);
router.patch(
  '/:id',
  authorizeRoles(ROLES.ANALYST, ROLES.ADMIN),
  updateTransactionValidator,
  validate,
  transactionController.updateTransaction
);

// Only Admin can delete
router.delete('/:id', authorizeRoles(ROLES.ADMIN), transactionController.deleteTransaction);

module.exports = router;
