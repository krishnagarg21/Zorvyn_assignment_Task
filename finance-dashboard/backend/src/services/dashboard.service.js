const Transaction = require('../models/Transaction.model');

/**
 * Dashboard service — all analytics powered by MongoDB aggregation pipelines.
 * No in-memory JS loops for aggregation.
 */

/**
 * Get summary totals: totalIncome, totalExpenses, netBalance, transactionCount.
 * @returns {Promise<object>}
 */
const getSummary = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: { $round: ['$totalIncome', 2] },
        totalExpenses: { $round: ['$totalExpenses', 2] },
        netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2] },
        transactionCount: 1,
      },
    },
  ]);

  // Return zeros if no transactions exist
  return result[0] || { totalIncome: 0, totalExpenses: 0, netBalance: 0, transactionCount: 0 };
};

/**
 * Get per-category breakdown split by income and expense.
 * @returns {Promise<Array>}
 */
const getCategoryBreakdown = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: { $round: ['$total', 2] },
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        breakdown: 1,
      },
    },
    { $sort: { category: 1 } },
  ]);

  return result;
};

/**
 * Get monthly income vs expense trend for a given year.
 * Returns data for all 12 months (Jan–Dec), filling in zeros for missing months.
 *
 * @param {number} year - The year to query (e.g. 2025)
 * @returns {Promise<Array>}
 */
const getMonthlyTrend = async (year) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const result = await Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: '$_id.month',
        data: {
          $push: {
            type: '$_id.type',
            total: { $round: ['$total', 2] },
          },
        },
      },
    },
  ]);

  // Build a complete 12-month array with zeros for missing months
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const trend = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const monthData = result.find((r) => r._id === monthNum);

    let income = 0;
    let expense = 0;

    if (monthData) {
      const incomeEntry = monthData.data.find((d) => d.type === 'income');
      const expenseEntry = monthData.data.find((d) => d.type === 'expense');
      if (incomeEntry) income = incomeEntry.total;
      if (expenseEntry) expense = expenseEntry.total;
    }

    return { month: name, income, expense };
  });

  return trend;
};

/**
 * Get the N most recent non-deleted transactions.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
const getRecentActivity = async (limit = 5) => {
  const transactions = await Transaction.find({ isDeleted: false })
    .populate('userId', 'name email')
    .sort({ date: -1 })
    .limit(limit);

  return transactions;
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrend, getRecentActivity };
