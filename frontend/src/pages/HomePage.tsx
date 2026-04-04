import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  const isAdmin    = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER' || isAdmin;

  return (
    <div className="home-dashboard">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.firstName ?? user?.username}!
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Browse Events — visible to all */}
        <Link to="/events" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#e0e7ff' }}>🎟️</div>
          <div className="dash-card-title">Browse Events</div>
          <div className="dash-card-desc">Discover upcoming events near you</div>
        </Link>

        {/* My Bookings — all approved users */}
        <Link to="/bookings" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#f0fdf4' }}>📋</div>
          <div className="dash-card-title">My Bookings</div>
          <div className="dash-card-desc">View and manage your reservations</div>
        </Link>

        {/* Messages — all approved users */}
        <Link to="/messaging" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef9c3' }}>💬</div>
          <div className="dash-card-title">Messages</div>
          <div className="dash-card-desc">Send and receive messages</div>
        </Link>

        {/* Organizer tools */}
        {isOrganizer && (
          <Link to="/manage-events" className="dash-card">
            <div className="dash-card-icon" style={{ background: '#ede9fe' }}>📅</div>
            <div className="dash-card-title">Manage Events</div>
            <div className="dash-card-desc">Create and manage your events</div>
          </Link>
        )}

        {/* Admin panel */}
        {isAdmin && (
          <Link to="/admin" className="dash-card">
            <div className="dash-card-icon" style={{ background: '#fee2e2' }}>🛡️</div>
            <div className="dash-card-title">Admin Panel</div>
            <div className="dash-card-desc">Manage users and platform settings</div>
          </Link>
        )}
      </div>
    </div>
  );
}

