import { Link } from 'react-router-dom';
import '../styles/WelcomePage.css';

export default function WelcomePage() {
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
          <Link to="/admin">Διαχειριστής</Link>
          <Link to="/events">Πελάτης</Link>
          <Link to="/login" className="login-btn">Login</Link>
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
