import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { getEvent, publishEvent, updateEvent } from '../api/eventsApi';
import type { Event, EventFormData } from '../types/event.types';
import EventForm from '../components/events/EventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getEvent(id).then((res: AxiosResponse<Event>) => setEvent(res.data));
  }, [id]);

  const handleSubmit = async (data: EventFormData, publishAfterSave: boolean) => {
    if (id) {
      await updateEvent(id, data);
      if (publishAfterSave) await publishEvent(id);
      navigate('/manage-events');
    }
  };

  if (!event) return <LoadingSpinner />;

  return (
    <div className="edit-event-page">
      <h1 style={{ marginBottom: '20px' }}>Επεξεργασία Εκδήλωσης</h1>
      <EventForm initial={event} onSubmit={handleSubmit} submitLabel="Αποθήκευση Αλλαγών" />
    </div>
  );
}
