import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Event } from '../../types/event.types';
import { eventTypeLabel } from '../../types/event.types';
import { formatDateTime } from '../../utils/dateFormat';
import { useAuth } from '../../hooks/useAuth';
import { createBooking } from '../../api/bookingsApi';
import TicketSelector from '../bookings/TicketSelector';
import '../../styles/EventDetailsModal.css';

interface EventDetailsModalProps { event: Event; onClose: () => void; }

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(false);
  const fallbackImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80';
  const imageUrl = event.photos?.[0] ? `http://localhost:3000/uploads/${event.photos[0].filename}` : fallbackImage;
  const bookable = event.status === 'PUBLISHED' && new Date(event.startDateTime) > new Date();

  const handleBook = async (ticketTypeId: string, numberOfTickets: number) => {
    try {
      setBookingLoading(true);
      await createBooking({ eventId: event.id, ticketTypeId, numberOfTickets });
      onClose();
      navigate('/bookings');
    } catch {
      alert('Αποτυχία κράτησης. Ελέγξτε τη διαθεσιμότητα και δοκιμάστε ξανά.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" role="dialog" aria-modal="true" aria-labelledby="event-modal-title" onClick={(click) => click.stopPropagation()}>
        <button className="event-modal-close" onClick={onClose} aria-label="Κλείσιμο">×</button>
        <header className="event-modal-header">
          <h2 id="event-modal-title" className="event-modal-title">{event.title}</h2>
          <div className="event-modal-meta"><span>{eventTypeLabel(event.eventType)}</span><span>📅 {formatDateTime(event.startDateTime)}</span><span>📍 {event.venue}, {event.city}</span></div>
        </header>
        <div className="event-modal-photos"><img src={imageUrl} alt={event.title} className="modal-photo-main" /></div>
        <div className="event-modal-body">
          <section className="event-modal-description">
            <h3>Σχετικά με την εκδήλωση</h3><p>{event.description}</p>
            <h3>Χώρος</h3><p><strong>{event.venue}</strong><br />{event.address}, {event.city}, {event.country}</p>
            <p><strong>Λήξη:</strong> {formatDateTime(event.endDateTime)} · <strong>Χωρητικότητα:</strong> {event.capacity}</p>
            <Link to={`/events/${event.id}`} onClick={onClose}>Πλήρης προβολή εκδήλωσης</Link>
          </section>
          <aside className="event-modal-booking">
            {!user ? <div className="login-prompt"><p>Συνδεθείτε για να κάνετε κράτηση εισιτηρίων.</p><Link to="/login">Σύνδεση</Link> · <Link to="/register">Εγγραφή</Link></div> : <TicketSelector event={event} ticketTypes={event.ticketTypes ?? []} onBook={handleBook} disabled={!bookable || event.organizerId === user.id} loading={bookingLoading} />}
          </aside>
        </div>
      </div>
    </div>
  );
}
