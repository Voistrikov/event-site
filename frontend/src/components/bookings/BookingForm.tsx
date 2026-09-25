import { useState } from 'react';
import { createBooking } from '../../api/bookingsApi';
import type { Event } from '../../types/event.types';
import ConfirmBookingDialog from './ConfirmBookingDialog';

interface BookingFormProps {
  event: Event;
  onSuccess?: () => void;
}

export default function BookingForm({ event, onSuccess }: BookingFormProps) {
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedTicket = event.ticketTypes.find((ticket) => ticket.id === ticketTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    try {
      setSubmitting(true);
      await createBooking({ eventId: event.id, ticketTypeId, numberOfTickets: quantity });
      setShowConfirmation(false);
      onSuccess?.();
    } catch {
      setError('Η κράτηση απέτυχε. Δοκιμάστε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {error && <p className="error">{error}</p>}
      <select value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)} required>
        <option value="">Επιλέξτε τύπο εισιτηρίου</option>
        {event.ticketTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} — €{t.price} ({t.available} διαθέσιμα)
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
      <button type="submit" disabled={submitting}>Κράτηση Εισιτηρίων</button>
      {showConfirmation && selectedTicket && <ConfirmBookingDialog event={event} ticketType={selectedTicket} quantity={quantity} totalCost={Number(selectedTicket.price) * quantity} loading={submitting} onCancel={() => setShowConfirmation(false)} onConfirm={confirmBooking} />}
    </form>
  );
}
