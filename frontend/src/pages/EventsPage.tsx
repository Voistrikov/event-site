import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MultiEventMap from '../components/events/MultiEventMap';
import '../styles/EventsPage.css';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { events, loading } = useEvents({ ...filters, page });

  return (
    <div className="events-split-container">
      {/* List Section */}
      <div className="events-list-section">
        <div className="events-list-header">
          <h1>Explore Properties</h1>
          <p>Find your next stay from our selection of premium locations.</p>
        </div>
        
        <EventFilters onFilter={setFilters} />
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="events-grid">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
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
        <MultiEventMap events={events} />
      </div>
    </div>
  );
}
