import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">◈</span>
          <span>FinanceHub</span>
        </Link>
      </div>

      <div className="navbar-links">
        {hasRole('ANALYST', 'ADMIN') && (
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        )}
        <Link
          to="/transactions"
          className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
        >
          Transactions
        </Link>
        {hasRole('ADMIN') && (
          <Link
            to="/users"
            className={`nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            Users
          </Link>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`user-role role-${user?.role?.toLowerCase()}`}>
            {user?.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
