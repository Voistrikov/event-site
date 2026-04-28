import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MultiEventMap from '../components/events/MultiEventMap';
import EventDetailsModal from '../components/events/EventDetailsModal';
import type { Event } from '../types/event.types';
import '../styles/EventsPage.css';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [mapLocation, setMapLocation] = useState<{lat: number; lng: number} | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Combine filters with mapLocation for the backend
  const activeFilters = useMemo(() => {
    const params = { ...filters, page, limit: 9 } as any;
    if (mapLocation) {
      params.lat = mapLocation.lat;
      params.lng = mapLocation.lng;
    }
    return params;
  }, [filters, page, mapLocation]);
  
  const { events, loading, totalPages, error } = useEvents(activeFilters);

  return (
    <div className="events-split-container">
      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      
      {/* List Section */}
      <div className="events-list-section">
        <div className="events-list-header">
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '1.5rem', margin: 0, letterSpacing: '2px', color: '#1b3858' }}>BOOKING PLACE</h2>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.8rem', margin: 0, color: '#1b3858' }}>Experience Unforgettable Journeys</p>
          </Link>
          <h1>Explore Properties</h1>
          <p>Find your next stay from our selection of premium locations.</p>
        </div>
        
        <EventFilters onFilter={(newFilter) => setFilters(prev => ({ ...prev, ...newFilter }))} />
        
        {error && (
          <div style={{ color: '#e53935', padding: '20px', textAlign: 'center', background: '#ffebee', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>Σφάλμα:</strong> {error}
          </div>
        )}
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="events-grid">
              {events.map((e) => (
                <EventCard key={e.id} event={e} onViewDetails={setSelectedEvent} />
              ))}
            </div>
            {events.length === 0 && (
              <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
                No properties found matching your criteria.
              </p>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Map Section */}
      <div className="events-map-section">
        {mapLocation && (
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>Αναζήτηση Κοντά σε Επιλεγμένο Σημείο</span>
            <button 
              onClick={() => setMapLocation(null)}
              style={{ marginLeft: 10, background: '#e53935', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem' }}
            >Καθαρισμός</button>
          </div>
        )}
        <MultiEventMap 
          events={events} 
          onViewDetails={setSelectedEvent} 
          mapLocation={mapLocation}
          onMapClick={(lat, lng) => setMapLocation({lat, lng})}
        />
      </div>
    </div>
  );
}
