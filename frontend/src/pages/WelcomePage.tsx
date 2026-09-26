import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/WelcomePage.css';

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="welcome-layout">
      {/* Top Navbar specifically for Welcome Page */}
      <nav className="welcome-navbar">
        <Link to="/" className="welcome-logo">
          <h2 className="brand-name">EventHub</h2>
          <p className="brand-tagline">Ανακαλύψτε Εκδηλώσεις</p>
        </Link>

        <div className="welcome-nav-links">
          <Link to="/search">Αναζήτηση εκδηλώσεων</Link>
          {!user ? (
            <>
              <Link to="/login" className="login-btn">Σύνδεση</Link>
            </>
          ) : (
            <>
              <Link to="/home">Εφαρμογή</Link>
              <button onClick={handleLogout} className="login-btn" style={{ border: 'none', cursor: 'pointer' }}>
                Αποσύνδεση
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Κλείστε Εισιτήρια<br />Εύκολα
        </h1>
        <div className="hero-buttons">
          <Link to={user ? '/events/create' : '/login'} className="hero-btn">ΔΗΜΙΟΥΡΓΗΣΤΕ ΕΚΔΗΛΩΣΗ</Link>
          <Link to="/search" className="hero-btn hero-btn-outline">ΒΡΕΙΤΕ ΕΚΔΗΛΩΣΗ</Link>
        </div>
      </div>
    </div>
  );
}
