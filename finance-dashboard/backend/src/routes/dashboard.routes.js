const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All dashboard routes require authentication + Analyst or Admin role
router.use(authenticate, authorizeRoles(ROLES.ANALYST, ROLES.ADMIN));

router.get('/summary', dashboardController.getSummary);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/monthly-trend', dashboardController.getMonthlyTrend);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
