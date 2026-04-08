import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUser, deleteUser, createUser } from '../api/users';

const ROLES = ['VIEWER', 'ANALYST', 'ADMIN'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: 10 });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      fetchUsers(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await deleteUser(userId);
      } else {
        await updateUser(userId, { isActive: true });
      }
      fetchUsers(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(form);
      setForm({ name: '', email: '', password: '', role: 'VIEWER' });
      setShowForm(false);
      fetchUsers(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">{meta.total} registered user{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="card form-card">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className={!u.isActive ? 'inactive-row' : ''}>
                      <td className="user-name-cell">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className={`role-select role-${u.role.toLowerCase()}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge status-${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-sm"
                disabled={meta.page <= 1}
                onClick={() => fetchUsers(meta.page - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchUsers(meta.page + 1)}
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

export default Users;
