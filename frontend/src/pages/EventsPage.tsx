import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import type { EventFilterValues } from '../components/events/EventFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MultiEventMap from '../components/events/MultiEventMap';
import EventDetailsModal from '../components/events/EventDetailsModal';
import type { Event } from '../types/event.types';
import '../styles/EventsPage.css';

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFilterValues>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [mapLocation, setMapLocation] = useState<{lat: number; lng: number} | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const search = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const setPage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage === 1) nextParams.delete('page');
    else nextParams.set('page', String(nextPage));
    setSearchParams(nextParams, { replace: true });
  };
  
  // Combine filters with mapLocation for the backend
  const activeFilters = useMemo(() => {
    const params: Record<string, unknown> = { ...filters, search: search.trim() || undefined, page, limit: 9 };
    if (mapLocation) {
      params.lat = mapLocation.lat;
      params.lng = mapLocation.lng;
    }
    return params;
  }, [filters, page, mapLocation, search]);
  
  const { events, loading, totalPages, error } = useEvents(activeFilters);

  return (
    <>
      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      
      <div className="events-split-container">
        {/* List Section */}
        <div className="events-list-section">
          <div className="events-list-header">
            <h1>Ανακαλύψτε Εκδηλώσεις</h1>
            <p>Βρείτε συναυλίες, σεμινάρια, παραστάσεις και πολλά ακόμη.</p>
          </div>
        
          <EventFilters
            showSearch={false}
            onFilter={(newFilter) => {
              setFilters(prev => ({ ...prev, ...newFilter }));
              setPage(1);
            }}
          />
        
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
                  Δεν βρέθηκαν εκδηλώσεις με αυτά τα κριτήρια.
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
    </>
  );
}
