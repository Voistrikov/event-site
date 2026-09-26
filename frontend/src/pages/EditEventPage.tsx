import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { addEventPhotos, deleteEventPhoto, getEvent, publishEvent, setMainEventPhoto, updateEvent } from '../api/eventsApi';
import type { Event, EventFormData } from '../types/event.types';
import EventForm, { type PhotoChanges } from '../components/events/EventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getEvent(id).then((res: AxiosResponse<Event>) => setEvent(res.data));
  }, [id]);

  const handleSubmit = async (data: EventFormData, publishAfterSave: boolean, photoChanges: PhotoChanges) => {
    if (id) {
      await updateEvent(id, data);
      for (const photoId of photoChanges.removePhotoIds) await deleteEventPhoto(id, photoId);
      let uploaded: { id: string }[] = [];
      if (photoChanges.files.length) uploaded = (await addEventPhotos(id, photoChanges.files)).data.photos;
      if (photoChanges.mainPhotoId) await setMainEventPhoto(id, photoChanges.mainPhotoId);
      else if (photoChanges.mainNewIndex !== undefined && uploaded[photoChanges.mainNewIndex]) await setMainEventPhoto(id, uploaded[photoChanges.mainNewIndex].id);
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
