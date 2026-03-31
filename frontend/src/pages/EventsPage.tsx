import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { events, loading } = useEvents({ ...filters, page });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="events-page">
      <h1>Events</h1>
      <EventFilters onFilter={setFilters} />
      <div className="events-grid">
        {events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
      <Pagination page={page} totalPages={10} onPageChange={setPage} />
    </div>
  );
}
