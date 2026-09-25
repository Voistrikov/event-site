import { useNavigate } from 'react-router-dom';
import { createEvent, publishEvent } from '../api/eventsApi';
import EventForm from '../components/events/EventForm';
import type { EventFormData } from '../types/event.types';

export default function CreateEventPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: EventFormData, publishAfterSave: boolean) => {
    const response = await createEvent(data);
    if (publishAfterSave) await publishEvent(response.data.id);
    navigate('/manage-events');
  };

  return (
    <div className="create-event-page">
      <h1 style={{ marginBottom: '20px' }}>Νέα Εκδήλωση</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
