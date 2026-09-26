import { useNavigate } from 'react-router-dom';
import { addEventPhotos, createEvent, publishEvent, setMainEventPhoto } from '../api/eventsApi';
import EventForm, { type PhotoChanges } from '../components/events/EventForm';
import type { EventFormData } from '../types/event.types';

export default function CreateEventPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: EventFormData, publishAfterSave: boolean, photoChanges: PhotoChanges) => {
    const response = await createEvent(data);
    if (photoChanges.files.length) {
      const uploaded = await addEventPhotos(response.data.id, photoChanges.files);
      if (photoChanges.mainNewIndex !== undefined) await setMainEventPhoto(response.data.id, uploaded.data.photos[photoChanges.mainNewIndex].id);
    }
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
