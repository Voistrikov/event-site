import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Event } from '../../types/event.types';
import { eventTypeLabel } from '../../types/event.types';
import { formatDateTime } from '../../utils/dateFormat';
import { useAuth } from '../../hooks/useAuth';
import { createBooking } from '../../api/bookingsApi';
import TicketSelector from '../bookings/TicketSelector';
import '../../styles/EventDetailsModal.css';
import { fileUrl } from '../../utils/imageUrl';

interface EventDetailsModalProps { event: Event; onClose: () => void; }

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(false);
  const imageUrl = fileUrl(event.photos?.[0]?.filename);
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
        <div className="event-modal-photos">{imageUrl ? <img src={imageUrl} alt={event.title} className="modal-photo-main" /> : <div className="modal-photo-main modal-photo-main--empty" aria-label="Δεν υπάρχει φωτογραφία" />}</div>
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
