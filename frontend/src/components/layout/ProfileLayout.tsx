import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ProfileLayout.css';

export default function ProfileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER' || isAdmin;

  return (
    <div className="profile-layout-wrapper">
      {/* Top Header */}
      <header className="profile-header">
        <Link to="/" className="profile-brand">
          <div className="profile-brand-icon">E</div>
          <span>EventApp</span>
        </Link>
        <div className="profile-header-actions">
          <span className="profile-user-greeting">
            Hello, <strong>{user?.firstName ?? user?.username}</strong>
          </span>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="profile-container">
        {/* Left Sidebar Navigation */}
        <aside className="profile-sidebar">
          <nav className="profile-nav">
            <NavLink 
              to="/home" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🏠</span> 
              Overview
            </NavLink>
            <NavLink 
              to="/profile/info" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">👤</span> 
              Προβολή Προφίλ
            </NavLink>
            <NavLink 
              to="/bookings" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span> 
              My Bookings
            </NavLink>
            <NavLink 
              to="/messaging" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">💬</span> 
              Messages
            </NavLink>

            {isOrganizer && (
              <>
                <div className="nav-divider"></div>
                <div className="nav-group-title">Organizer</div>
                <NavLink 
                  to="/manage-events" 
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">📅</span> 
                  Manage Events
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <div className="nav-divider"></div>
                <div className="nav-group-title">Admin</div>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">🛡️</span> 
                  Admin Panel
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="profile-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
