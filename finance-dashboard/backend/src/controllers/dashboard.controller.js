const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get total income, expenses, net balance, transaction count
 * @access  Analyst, Admin
 */
const getSummary = asyncHandler(async (_req, res) => {
  const summary = await dashboardService.getSummary();
  return sendSuccess(res, 200, 'Dashboard summary fetched successfully', summary);
});

/**
 * @route   GET /api/dashboard/category-breakdown
 * @desc    Get per-category totals split by income/expense
 * @access  Analyst, Admin
 */
const getCategoryBreakdown = asyncHandler(async (_req, res) => {
  const breakdown = await dashboardService.getCategoryBreakdown();
  return sendSuccess(res, 200, 'Category breakdown fetched successfully', breakdown);
});

/**
 * @route   GET /api/dashboard/monthly-trend
 * @desc    Get month-by-month income vs expense for a given year
 * @access  Analyst, Admin
 */
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const trend = await dashboardService.getMonthlyTrend(year);
  return sendSuccess(res, 200, 'Monthly trend fetched successfully', trend);
});

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get the most recent non-deleted transactions
 * @access  Analyst, Admin
 */
const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const transactions = await dashboardService.getRecentActivity(limit);
  return sendSuccess(res, 200, 'Recent activity fetched successfully', transactions);
});

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrend, getRecentActivity };
