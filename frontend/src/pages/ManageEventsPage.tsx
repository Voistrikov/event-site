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
      <div className="profile-page-header">
        <h1 className="profile-page-title" style={{ marginBottom: 8 }}>Τα Ακίνητά μου</h1>
        <Link to="/events/create" className="btn btn-primary btn-sm">Νέα Καταχώρηση</Link>
      </div>
      <EventTable events={events} onDelete={handleDelete} />
    </div>
  );
}
