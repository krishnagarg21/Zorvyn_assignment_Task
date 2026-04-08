import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/transactions';

const TYPES = ['income', 'expense'];
const CATEGORIES = [
  'salary', 'rent', 'food', 'utilities', 'investment',
  'entertainment', 'healthcare', 'transport', 'education', 'other',
];

const Transactions = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ANALYST', 'ADMIN');
  const canDelete = hasRole('ADMIN');

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getTransactions(params);
      setTransactions(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, startDate, endDate]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateTransaction(editing, { ...form, amount: Number(form.amount) });
      } else {
        await createTransaction({ ...form, amount: Number(form.amount) });
      }
      resetForm();
      fetchTransactions(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (txn) => {
    setEditing(txn._id);
    setForm({
      amount: txn.amount,
      type: txn.type,
      category: txn.category,
      date: new Date(txn.date).toISOString().split('T')[0],
      notes: txn.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      fetchTransactions(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setForm({
      amount: '',
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-subtitle">
            {meta.total} total transaction{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        {canWrite && (
          <button
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm ? 'Cancel' : '+ New Transaction'}
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && canWrite && (
        <div className="card form-card">
          <h3>{editing ? 'Edit Transaction' : 'New Transaction'}</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <input
                type="text"
                maxLength={500}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add a note..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card filter-card">
        <div className="filter-row">
          <div className="form-group">
            <label>Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Created By</th>
                  {(canWrite || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite || canDelete ? 7 : 6} className="empty-state">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td>
                        {new Date(txn.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className={`type-badge type-${txn.type}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="capitalize">{txn.category}</td>
                      <td className={`amount-${txn.type}`}>
                        {txn.type === 'income' ? '+' : '-'}
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="notes-cell">{txn.notes || '—'}</td>
                      <td>{txn.userId?.name || 'Unknown'}</td>
                      {(canWrite || canDelete) && (
                        <td className="actions-cell">
                          {canWrite && (
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleEdit(txn)}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(txn._id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-sm"
                disabled={meta.page <= 1}
                onClick={() => fetchTransactions(meta.page - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchTransactions(meta.page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
