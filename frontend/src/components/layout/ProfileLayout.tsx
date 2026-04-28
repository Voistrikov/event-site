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
          <div className="profile-brand-icon" style={{ backgroundColor: '#1b3858', color: 'white', fontWeight: 'bold' }}>B</div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '1px', color: '#1b3858' }}>BOOKING PLACE</span>
        </Link>
        <div className="profile-header-actions">
          <span className="profile-user-greeting">
            Γεια σας, <strong>{user?.firstName ?? user?.username}</strong>
          </span>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Αποσύνδεση
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
              Αρχική
            </NavLink>
            <NavLink 
              to="/profile/info" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">👤</span> 
              Προφίλ
            </NavLink>
            <NavLink 
              to="/bookings" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span> 
              Οι Κρατήσεις μου
            </NavLink>
            <NavLink 
              to="/messaging" 
              className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">💬</span> 
              Μηνύματα
            </NavLink>

            {isOrganizer && (
              <>
                <div className="nav-divider"></div>
                <div className="nav-group-title">Ιδιοκτήτης</div>
                <NavLink 
                  to="/manage-events" 
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔑</span> 
                  Τα Ακίνητά μου
                </NavLink>
                <NavLink 
                  to="/manage-bookings" 
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">📅</span> 
                  Διαχείριση Κρατήσεων
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <div className="nav-divider"></div>
                <div className="nav-group-title">Διαχείριση Συστήματος</div>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">🛡️</span> 
                  Πίνακας Ελέγχου
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
