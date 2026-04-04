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
          <h2>BOOKING PLACE</h2>
          <p>Experience Unforgettable Journeys</p>
        </Link>

        {/* Links requested: αναζήτηση σπιτιού, διαχειριστής, πελάτης + Login field right */}
        <div className="welcome-nav-links">
          <Link to="/search">Αναζήτηση σπιτιού</Link>
          {!user ? (
            <>
              <Link to="/login">Διαχειριστής</Link>
              <Link to="/login">Πελάτης</Link>
              <Link to="/login" className="login-btn">Login</Link>
            </>
          ) : (
            <>
              <Link to="/home">Εφαρμογή</Link>
              <button onClick={handleLogout} className="login-btn" style={{ border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Book Your Stay<br />With Ease
        </h1>
        <div className="hero-buttons">
          <Link to="/place-home" className="hero-btn">PLACE YOUR HOME</Link>
          <Link to="/search" className="hero-btn hero-btn-outline">BOOK YOUR STAY</Link>
        </div>
      </div>
    </div>
  );
}
