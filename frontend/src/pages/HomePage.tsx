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
          <div className="dash-card-icon" style={{ background: '#e0e7ff' }}>🏠</div>
          <div className="dash-card-title">Αναζήτηση Ακινήτων</div>
          <div className="dash-card-desc">Ανακαλύψτε διαθέσιμα καταλύματα στην περιοχή σας</div>
        </Link>

        {/* My Bookings — all approved users */}
        <Link to="/bookings" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#f0fdf4' }}>📋</div>
          <div className="dash-card-title">Οι Κρατήσεις μου</div>
          <div className="dash-card-desc">Προβολή και διαχείριση των κρατήσεών σας</div>
        </Link>

        {/* Messages — all approved users */}
        <Link to="/messaging" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef9c3' }}>💬</div>
          <div className="dash-card-title">Μηνύματα</div>
          <div className="dash-card-desc">Επικοινωνία με ιδιοκτήτες ή πελάτες</div>
        </Link>

        {/* Organizer tools */}
        {isOrganizer && (
          <Link to="/manage-events" className="dash-card">
            <div className="dash-card-icon" style={{ background: '#ede9fe' }}>🔑</div>
            <div className="dash-card-title">Τα Ακίνητά μου</div>
            <div className="dash-card-desc">Διαχείριση και καταχώρηση νέων ακινήτων</div>
          </Link>
        )}

        {/* Admin panel */}
        {isAdmin && (
          <Link to="/admin" className="dash-card">
            <div className="dash-card-icon" style={{ background: '#fee2e2' }}>🛡️</div>
            <div className="dash-card-title">Πίνακας Ελέγχου</div>
            <div className="dash-card-desc">Διαχείριση πλατφόρμας και χρηστών</div>
          </Link>
        )}
      </div>
    </div>
  );
}

