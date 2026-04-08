import client from './client';

export const getSummary = () => client.get('/dashboard/summary');

export const getCategoryBreakdown = () => client.get('/dashboard/category-breakdown');

export const getMonthlyTrend = (year) => client.get('/dashboard/monthly-trend', { params: { year } });

export const getRecentActivity = (limit = 5) => client.get('/dashboard/recent-activity', { params: { limit } });
