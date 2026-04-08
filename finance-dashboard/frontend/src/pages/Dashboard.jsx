import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getSummary, getMonthlyTrend, getRecentActivity } from '../api/dashboard';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, trendRes, recentRes] = await Promise.all([
          getSummary(),
          getMonthlyTrend(year),
          getRecentActivity(5),
        ]);
        setSummary(summaryRes.data.data);
        setTrend(trendRes.data.data);
        setRecent(recentRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  if (loading) {
    return <div className="page-loader"><div className="spinner" /></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Financial overview at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card card-income">
          <div className="card-icon">↑</div>
          <div className="card-content">
            <p className="card-label">Total Income</p>
            <h2 className="card-value">{formatCurrency(summary?.totalIncome || 0)}</h2>
          </div>
        </div>
        <div className="summary-card card-expense">
          <div className="card-icon">↓</div>
          <div className="card-content">
            <p className="card-label">Total Expenses</p>
            <h2 className="card-value">{formatCurrency(summary?.totalExpenses || 0)}</h2>
          </div>
        </div>
        <div className="summary-card card-balance">
          <div className="card-icon">◎</div>
          <div className="card-content">
            <p className="card-label">Net Balance</p>
            <h2 className="card-value">{formatCurrency(summary?.netBalance || 0)}</h2>
          </div>
        </div>
        <div className="summary-card card-count">
          <div className="card-icon">≡</div>
          <div className="card-content">
            <p className="card-label">Transactions</p>
            <h2 className="card-value">{summary?.transactionCount || 0}</h2>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Monthly Trend</h2>
          <div className="year-selector">
            <button
              className="btn btn-sm"
              onClick={() => setYear((y) => y - 1)}
            >
              ‹
            </button>
            <span className="year-label">{year}</span>
            <button
              className="btn btn-sm"
              onClick={() => setYear((y) => y + 1)}
            >
              ›
            </button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(value) => [formatCurrency(value)]}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <h2>Recent Activity</h2>
        <div className="recent-list">
          {recent.length === 0 ? (
            <p className="empty-state">No recent transactions found.</p>
          ) : (
            recent.map((txn) => (
              <div key={txn._id} className="recent-item">
                <div className="recent-info">
                  <span className={`type-badge type-${txn.type}`}>
                    {txn.type === 'income' ? '↑' : '↓'}
                  </span>
                  <div>
                    <p className="recent-category">{txn.category}</p>
                    <p className="recent-date">
                      {new Date(txn.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`recent-amount amount-${txn.type}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
