import { useCallback, useEffect, useState } from 'react';
import { getEvents, deleteEvent, publishEvent, cancelEvent, completeEvent } from '../api/eventsApi';
import type { Event } from '../types/event.types';
import EventTable from '../components/events/EventTable';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  const load = useCallback(() => {
    if (user) {
      getEvents({ organizerId: user.id }).then((res) => setEvents(res.data.events || res.data));
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Να διαγραφεί οριστικά αυτή η εκδήλωση;')) return;
    await deleteEvent(id);
    load();
  };

  const handlePublish = async (id: string) => { await publishEvent(id); load(); };
  const handleCancel = async (id: string) => {
    if (!window.confirm('Να ακυρωθεί η εκδήλωση; Οι ενεργές κρατήσεις θα ακυρωθούν και οι συμμετέχοντες θα ενημερωθούν.')) return;
    await cancelEvent(id); load();
  };
  const handleComplete = async (id: string) => { await completeEvent(id); load(); };

  return (
    <div className="manage-events-page">
      <div className="profile-page-header">
        <h1 className="profile-page-title" style={{ marginBottom: 8 }}>Οι Εκδηλώσεις μου</h1>
        <Link to="/events/create" className="btn btn-primary btn-sm">Νέα Εκδήλωση</Link>
      </div>
      <EventTable events={events} onDelete={handleDelete} onPublish={handlePublish} onCancel={handleCancel} onComplete={handleComplete} />
    </div>
  );
}
