import { useState } from 'react';
import type { Event } from '../../types/event.types';

interface EventFormProps {
  initial?: Partial<Event>;
  onSubmit: (data: Partial<Event>) => void;
}

export default function EventForm({ initial = {}, onSubmit }: EventFormProps) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [category, setCategory] = useState(initial.category ?? '');
  const [location, setLocation] = useState(initial.location ?? '');
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [endDate, setEndDate] = useState(initial.endDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, category, location, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
      <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      <button type="submit">Save</button>
    </form>
  );
}
