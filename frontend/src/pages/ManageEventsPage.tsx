import { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '../api/eventsApi';
import type { Event } from '../types/event.types';
import EventTable from '../components/events/EventTable';
import { Link } from 'react-router-dom';

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  const load = () => getEvents().then((res) => setEvents(res.data));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    load();
  };

  return (
    <div className="manage-events-page">
      <h1>My Events</h1>
      <Link to="/events/create">Create Event</Link>
      <EventTable events={events} onDelete={handleDelete} />
    </div>
  );
}
