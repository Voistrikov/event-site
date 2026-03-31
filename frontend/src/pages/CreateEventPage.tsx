import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/eventsApi';
import EventForm from '../components/events/EventForm';
import type { Event } from '../types/event.types';

export default function CreateEventPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Event>) => {
    await createEvent(data);
    navigate('/manage-events');
  };

  return (
    <div className="create-event-page">
      <h1>Create Event</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
