import { useEffect, useMemo, useState } from 'react';
import type { Category, Event, EventFormData, EventType } from '../../types/event.types';
import { EVENT_TYPES } from '../../types/event.types';
import MultiEventMap from './MultiEventMap';
import { getCategories } from '../../api/eventsApi';

interface EventFormProps {
  initial?: Partial<Event>;
  onSubmit: (data: EventFormData, publishAfterSave: boolean) => Promise<void> | void;
  submitLabel?: string;
}

const FALLBACK_CATEGORIES = ['Μουσική', 'Τέχνες', 'Εκπαίδευση', 'Τεχνολογία', 'Αθλητισμός', 'Πολιτισμός'];
const toLocalDateTime = (value?: string) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function EventForm({ initial = {}, onSubmit, submitLabel = 'Αποθήκευση ως Πρόχειρο' }: EventFormProps) {
  const [form, setForm] = useState({
    title: initial.title ?? '', description: initial.description ?? '', eventType: (initial.eventType ?? '') as EventType | '',
    venue: initial.venue ?? '', address: initial.address ?? '', city: initial.city ?? '', country: initial.country ?? '',
    latitude: initial.latitude, longitude: initial.longitude, startDateTime: toLocalDateTime(initial.startDateTime),
    endDateTime: toLocalDateTime(initial.endDateTime), capacity: initial.capacity ?? 1,
  });
  const initialCategories = initial.categories?.map((entry) => entry.category?.name).filter(Boolean) ?? [];
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => [...new Set([...FALLBACK_CATEGORIES, ...initialCategories])]);
  const [ticketTypes, setTicketTypes] = useState<Array<{ id?: string; name: string; price: number; quantity: number }>>((initial.ticketTypes ?? []).map((ticket) => ({ id: ticket.id, name: ticket.name, price: Number(ticket.price), quantity: ticket.quantity })));
  const [submitting, setSubmitting] = useState(false);
  const [publishAfterSave, setPublishAfterSave] = useState(false);
  const totalTickets = useMemo(() => ticketTypes.reduce((sum, ticket) => sum + (Number(ticket.quantity) || 0), 0), [ticketTypes]);

  useEffect(() => {
    getCategories().then(({ data }: { data: Category[] }) => setCategoryOptions([...new Set([...data.map((category) => category.name), ...initialCategories])])).catch(() => undefined);
  // Initial categories belong to the loaded event and do not change during a form session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (field: string, value: string | number | undefined) => setForm((current) => ({ ...current, [field]: value }));
  const updateTicket = (index: number, field: 'name' | 'price' | 'quantity', value: string | number) => setTicketTypes((current) => current.map((ticket, ticketIndex) => ticketIndex === index ? { ...ticket, [field]: value } : ticket));

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!form.eventType || categories.length === 0 || ticketTypes.length === 0 || totalTickets > form.capacity) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, eventType: form.eventType, categories, ticketTypes: ticketTypes.map((ticket) => ({ ...ticket, price: Number(ticket.price), quantity: Number(ticket.quantity) })) }, publishAfterSave);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="event-form-grid">
        <label className="form-field form-field-wide">Τίτλος<input value={form.title} onChange={(e) => setField('title', e.target.value)} required /></label>
        <label className="form-field">Τύπος Εκδήλωσης<select value={form.eventType} onChange={(e) => setField('eventType', e.target.value)} required><option value="">Επιλέξτε τύπο</option>{EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
        <label className="form-field">Χωρητικότητα<input type="number" min="1" value={form.capacity} onChange={(e) => setField('capacity', Number(e.target.value))} required /></label>
        <label className="form-field form-field-wide">Περιγραφή<textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={5} required /></label>
        <label className="form-field">Χώρος διεξαγωγής<input value={form.venue} onChange={(e) => setField('venue', e.target.value)} required /></label>
        <label className="form-field">Διεύθυνση<input value={form.address} onChange={(e) => setField('address', e.target.value)} required /></label>
        <label className="form-field">Πόλη<input value={form.city} onChange={(e) => setField('city', e.target.value)} required /></label>
        <label className="form-field">Χώρα<input value={form.country} onChange={(e) => setField('country', e.target.value)} required /></label>
        <label className="form-field">Έναρξη<input type="datetime-local" value={form.startDateTime} onChange={(e) => setField('startDateTime', e.target.value)} required /></label>
        <label className="form-field">Λήξη<input type="datetime-local" value={form.endDateTime} min={form.startDateTime} onChange={(e) => setField('endDateTime', e.target.value)} required /></label>
      </div>

      <fieldset className="category-picker"><legend>Κατηγορίες (επιλέξτε τουλάχιστον μία)</legend>{categoryOptions.map((category) => <label key={category}><input type="checkbox" checked={categories.includes(category)} onChange={() => setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} /> {category}</label>)}{categories.length === 0 && <span className="error-text">Επιλέξτε τουλάχιστον μία κατηγορία.</span>}</fieldset>

      <section className="location-picker"><h3>Τοποθεσία στον χάρτη</h3><p>Κάντε κλικ στον χάρτη για να ορίσετε το σημείο της εκδήλωσης.</p><div className="event-form-map"><MultiEventMap events={[]} mapLocation={form.latitude != null && form.longitude != null ? { lat: form.latitude, lng: form.longitude } : null} onMapClick={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))} /></div>{form.latitude != null && form.longitude != null && <small>{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</small>}</section>

      <section className="ticket-types-section">
        <div className="section-heading-row"><h3>Τύποι Εισιτηρίων</h3><button type="button" onClick={() => setTicketTypes((current) => [...current, { name: '', price: 0, quantity: 1 }])}>+ Προσθήκη Τύπου</button></div>
        {ticketTypes.map((ticket, index) => <div key={ticket.id ?? index} className="ticket-type-row"><input aria-label="Ονομασία εισιτηρίου" placeholder="Ονομασία (π.χ. Κανονικό)" value={ticket.name} onChange={(e) => updateTicket(index, 'name', e.target.value)} required /><input aria-label="Τιμή εισιτηρίου" type="number" placeholder="Τιμή (€)" value={ticket.price} min="0" step="0.01" onChange={(e) => updateTicket(index, 'price', Number(e.target.value))} required /><input aria-label="Ποσότητα εισιτηρίων" type="number" placeholder="Ποσότητα" value={ticket.quantity} min="1" onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))} required /><button type="button" aria-label="Αφαίρεση τύπου εισιτηρίου" onClick={() => setTicketTypes((current) => current.filter((_, ticketIndex) => ticketIndex !== index))}>✕</button></div>)}
        {ticketTypes.length === 0 && <p className="error-text">Προσθέστε τουλάχιστον έναν τύπο εισιτηρίου.</p>}
        <div className={totalTickets > form.capacity ? 'capacity-summary error-text' : 'capacity-summary'}>Σύνολο εισιτηρίων: {totalTickets} / {form.capacity} χωρητικότητα {totalTickets > form.capacity && <strong> — ⚠️ Υπέρβαση χωρητικότητας!</strong>}</div>
      </section>
      <div className="event-form-actions">
        <button className="event-form-submit" type="submit" onClick={() => setPublishAfterSave(false)} disabled={submitting || !form.eventType || categories.length === 0 || ticketTypes.length === 0 || totalTickets === 0 || totalTickets > form.capacity}>{submitting && !publishAfterSave ? 'Αποθήκευση...' : submitLabel}</button>
        {(initial.status === undefined || initial.status === 'DRAFT') && <button className="event-form-submit event-form-publish" type="submit" onClick={() => setPublishAfterSave(true)} disabled={submitting || !form.eventType || categories.length === 0 || ticketTypes.length === 0 || totalTickets === 0 || totalTickets > form.capacity}>{submitting && publishAfterSave ? 'Δημοσίευση...' : 'Αποθήκευση & Δημοσίευση'}</button>}
      </div>
    </form>
  );
}
