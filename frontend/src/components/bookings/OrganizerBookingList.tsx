import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';

interface OrganizerBookingListProps { bookings: Booking[]; }

export default function OrganizerBookingList({ bookings }: OrganizerBookingListProps) {
  return (
    <ul className="booking-list">
      {bookings.map((b) => (
        <li key={b.id} className="booking-card">
          <div className="booking-card-header">
            <span className="booking-id">Αίτημα #{b.id.slice(0, 8)}</span>
            <span className="booking-date">{formatDate(b.createdAt)}</span>
          </div>
          <div className="booking-card-body">
            <div className="booking-detail">
              <span className="booking-detail-label">Εκδήλωση</span>
              <span className="booking-detail-value">{b.event?.title}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Επισκέπτης</span>
              <span className="booking-detail-value">{b.user?.firstName} {b.user?.lastName}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Τύπος εισιτηρίου</span>
              <span className="booking-detail-value">{b.ticketType?.name ?? '—'}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Εισιτήρια</span>
              <span className="booking-detail-value">{b.numberOfTickets}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Σύνολο</span>
              <span className="booking-detail-value">€{Number(b.totalCost).toFixed(2)}</span>
            </div>
            <div className="booking-detail">
              <span className={`booking-status status-${b.status.toLowerCase()}`}>
                {b.status === 'CONFIRMED' ? 'Επιβεβαιώθηκε' : 
                 b.status === 'CANCELLED' ? 'Ακυρώθηκε' : 
                 b.status === 'REJECTED' ? 'Απορρίφθηκε' : 'Σε αναμονή'}
              </span>
            </div>
          </div>
          
        </li>
      ))}
    </ul>
  );
}
