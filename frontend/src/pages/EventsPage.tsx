import { useState } from 'react';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { events, loading } = useEvents({ ...filters, page });

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
            <Pagination page={page} totalPages={10} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Map Section */}
      <div className="events-map-section">
        <MultiEventMap events={events} onViewDetails={setSelectedEvent} />
      </div>
    </div>
  );
}
