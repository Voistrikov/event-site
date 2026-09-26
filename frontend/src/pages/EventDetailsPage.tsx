import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEvent } from '../api/eventsApi';
import { createBooking } from '../api/bookingsApi';
import { useAuth } from '../hooks/useAuth';
import type { Event } from '../types/event.types';
import { eventTypeLabel } from '../types/event.types';
import TicketSelector from '../components/bookings/TicketSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventMap from '../components/events/EventMap';
import EventsNavbar from '../components/layout/EventsNavbar';
import { formatDateTime } from '../utils/dateFormat';
import '../styles/EventDetailsPage.css';
import { fileUrl } from '../utils/imageUrl';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'ΠΡΟΣΧΕΔΙΟ', PUBLISHED: 'ΔΗΜΟΣΙΕΥΜΕΝΗ', COMPLETED: 'ΟΛΟΚΛΗΡΩΜΕΝΗ', CANCELLED: 'ΑΚΥΡΩΜΕΝΗ',
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEvent(id).then((response) => setEvent(response.data)).catch(() => setError('Δεν ήταν δυνατή η φόρτωση της εκδήλωσης.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="events-page event-details-wrapper">
        <EventsNavbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="events-page event-details-wrapper">
        <EventsNavbar />
        <div className="event-details-error">{error || 'Η εκδήλωση δεν βρέθηκε.'}</div>
      </div>
    );
  }

  const photos = event.photos ?? [];
  const mainImage = fileUrl(photos[0]?.filename);
  const categoryNames = event.categories?.map((link) => link.category?.name).filter(Boolean) ?? [];
  const bookable = event.status === 'PUBLISHED' && new Date(event.startDateTime) > new Date();

  const handleBook = async (ticketTypeId: string, numberOfTickets: number) => {
    try {
      setBookingLoading(true);
      await createBooking({ eventId: event.id, ticketTypeId, numberOfTickets });
      navigate('/bookings');
    } catch {
      alert('Αποτυχία κράτησης. Ελέγξτε τη διαθεσιμότητα και δοκιμάστε ξανά.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="events-page event-details-wrapper">
      <EventsNavbar />

      <main className="event-details-page">
        <div className="event-title-row">
          <div>
            <h1 className="event-details-title">{event.title}</h1>
            <div className="event-badges">
              <span className="event-type-badge">{eventTypeLabel(event.eventType)}</span>
              <span className={`event-status-badge status-${event.status.toLowerCase()}`}>{STATUS_LABELS[event.status]}</span>
              {categoryNames.map((name) => <span key={name} className="category-badge">{name}</span>)}
            </div>
          </div>
          <Link to="/events" className="back-to-events">← Όλες οι εκδηλώσεις</Link>
        </div>

        <div className="event-details-photos">
          {mainImage ? <img src={mainImage} alt={event.title} className="event-photo-main" /> : <div className="event-photo-main event-photo-main--empty" aria-label="Δεν υπάρχει φωτογραφία" />}
          {photos.slice(1).map((photo, index) => <img key={photo.id} src={fileUrl(photo.filename) ?? ''} alt={`Φωτογραφία εκδήλωσης ${index + 2}`} className="event-photo-secondary" />)}
        </div>

        <div className="event-details-content">
          <div className="event-details-left">
            <section className="event-facts-grid">
              <div className="event-info-panel"><h2>📅 Ημερομηνία & Ώρα</h2><p><strong>Έναρξη:</strong> {formatDateTime(event.startDateTime)}</p><p><strong>Λήξη:</strong> {formatDateTime(event.endDateTime)}</p></div>
              <div className="event-info-panel"><h2>📍 Χώρος</h2><p><strong>{event.venue}</strong></p><p>{event.address}, {event.city}, {event.country}</p><p>Χωρητικότητα: {event.capacity} άτομα</p></div>
            </section>
            <section className="event-description-box"><h2>📝 Περιγραφή</h2><p>{event.description}</p></section>
            <section className="event-host-info">
              <div className="host-avatar">{event.organizer?.firstName?.[0] ?? 'Δ'}</div>
              <div className="host-details"><h3>Διοργανωτής</h3><p>{event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Διοργανωτής εκδήλωσης'}</p></div>
            </section>
            {event.latitude != null && event.longitude != null && <section className="map-container-details"><h2>🗺️ Τοποθεσία</h2><EventMap latitude={event.latitude} longitude={event.longitude} title={event.title} /></section>}
          </div>

          <aside className="event-details-right">
            <div className="booking-card">
              {!user ? (
                <div className="login-prompt"><h3>🎫 Κράτηση Εισιτηρίων</h3><p>Συνδεθείτε για να κάνετε κράτηση εισιτηρίων.</p><Link to="/login">Σύνδεση</Link> <span>ή</span> <Link to="/register">Εγγραφή</Link></div>
              ) : (
                <>
                  {!bookable && <p className="event-not-bookable">Η εκδήλωση δεν δέχεται κρατήσεις.</p>}
                  <TicketSelector event={event} ticketTypes={event.ticketTypes ?? []} onBook={handleBook} disabled={!bookable || event.organizerId === user.id} loading={bookingLoading} />
                  {event.organizerId === user.id && <p className="event-not-bookable">Δεν μπορείτε να κάνετε κράτηση στη δική σας εκδήλωση.</p>}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
