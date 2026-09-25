import React, { useState, useEffect } from 'react';
import { getRecommendedEvents } from '../api/eventsApi';
import EventCard from '../components/events/EventCard';

function HomePage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendedEvents()
      .then(res => {
        setRecommendations(res.data.events || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Καλώς ήρθατε στο TEDI Events!</h1>
      <p>Εδώ θα εμφανίζονται οι προσεχείς εκδηλώσεις.</p>
      
      <hr style={{ margin: '40px 0', borderColor: '#e5e7eb' }} />
      
      {/* Recommendations Section */}
      <div style={{ textAlign: 'left', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '20px' }}>
          ✨ Προτεινόμενες Εκδηλώσεις (Αλγόριθμος Συστάσεων)
        </h2>
        <p style={{ color: '#6b7280', margin: '-12px 0 20px' }}>
          Βασισμένο στις κρατήσεις και τις εκδηλώσεις που έχετε επισκεφθεί
        </p>
        {loading ? (
          <div>Φόρτωση προτάσεων...</div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', textAlign: 'left' }}>
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

export default HomePage;
