import { useState } from 'react';
import { createBooking } from '../../api/bookingsApi';
import type { Event } from '../../types/event.types';

interface BookingFormProps {
  event: Event;
  onSuccess?: () => void;
}

export default function BookingForm({ event, onSuccess }: BookingFormProps) {
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBooking({ eventId: event.id, ticketTypeId, quantity });
      onSuccess?.();
    } catch {
      setError('Booking failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {error && <p className="error">{error}</p>}
      <select value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)} required>
        <option value="">Select ticket type</option>
        {event.ticketTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} — €{t.price} ({t.available} left)
          </option>
        ))}
      </select>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min={1}
        required
      />
      <button type="submit">Book</button>
    </form>
  );
}
