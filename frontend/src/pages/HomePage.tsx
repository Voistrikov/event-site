import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { getRecommendedEvents } from '../api/eventsApi';
import type { Event } from '../types/event.types';
import EventCard from '../components/events/EventCard';

export default function HomePage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendedEvents()
      .then(res => {
        setRecommendations(res.data.events || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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

      <div className="dashboard-grid" style={{ marginBottom: '40px' }}>
        {/* Browse Events — visible to all */}
        <Link to="/events" className="dash-card">
          <div className="dash-card-icon" style={{ background: '#e0e7ff' }}>🎭</div>
          <div className="dash-card-title">Αναζήτηση Εκδηλώσεων</div>
          <div className="dash-card-desc">Ανακαλύψτε εκδηλώσεις στην περιοχή σας</div>
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
          <div className="dash-card-desc">Επικοινωνία με διοργανωτές ή συμμετέχοντες</div>
        </Link>

        {/* Organizer tools */}
        {isOrganizer && (
          <Link to="/manage-events" className="dash-card">
            <div className="dash-card-icon" style={{ background: '#ede9fe' }}>🎟️</div>
            <div className="dash-card-title">Οι Εκδηλώσεις μου</div>
            <div className="dash-card-desc">Διαχείριση και δημιουργία νέων εκδηλώσεων</div>
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

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
          ✨ Προτεινόμενες Εκδηλώσεις (Αλγόριθμος Συστάσεων)
        </h2>
        <p style={{ color: '#6b7280', margin: '-8px 0 16px' }}>
          Βασισμένο στις κρατήσεις και τις εκδηλώσεις που έχετε επισκεφθεί
        </p>
        {loading ? (
          <div className="spinner"></div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {recommendations.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>Δεν υπάρχουν αρκετά δεδομένα για προτάσεις αυτή τη στιγμή.</p>
        )}
      </div>
    </div>
  );
}
