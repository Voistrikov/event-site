import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { getEvent, updateEvent } from '../api/eventsApi';
import type { Event } from '../types/event.types';
import EventForm from '../components/events/EventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getEvent(id).then((res: AxiosResponse<Event>) => setEvent(res.data));
  }, [id]);

  const handleSubmit = async (data: Partial<Event>) => {
    if (id) {
      await updateEvent(id, data);
      navigate('/manage-events');
    }
  };

  if (!event) return <LoadingSpinner />;

  return (
    <div className="edit-event-page">
      <h1>Edit Event</h1>
      <EventForm initial={event} onSubmit={handleSubmit} />
    </div>
  );
}
