const express = require('express');
const userController = require('../controllers/user.controller');
const { createUserValidator, updateUserValidator } = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All routes below require authentication
router.use(authenticate);

// GET /api/users/me — accessible to all authenticated roles
router.get('/me', userController.getMe);

// Admin-only routes
router.get('/', authorizeRoles(ROLES.ADMIN), userController.listUsers);
router.get('/:id', authorizeRoles(ROLES.ADMIN), userController.getUser);
router.post('/', authorizeRoles(ROLES.ADMIN), createUserValidator, validate, userController.createUser);
router.patch('/:id', authorizeRoles(ROLES.ADMIN), updateUserValidator, validate, userController.updateUser);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
