import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (id: string) => void;
}

export default function BookingList({ bookings, onCancel }: BookingListProps) {
  return (
    <ul className="booking-list">
      {bookings.map((b) => (
        <li key={b.id} className="booking-card">
          <div className="booking-card-header">
            <span className="booking-id">Κράτηση #{b.id.slice(0, 8)}</span>
            <span className="booking-date">{formatDate(b.createdAt)}</span>
          </div>
          <div className="booking-card-body">
            <div className="booking-detail">
              <span className="booking-detail-label">Ποσότητα</span>
              <span className="booking-detail-value">{b.quantity}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Σύνολο</span>
              <span className="booking-detail-value">€{b.totalPrice}</span>
            </div>
            <div className="booking-detail">
              <span className={`booking-status status-${b.status}`}>
                {b.status === 'confirmed' ? 'Επιβεβαιώθηκε' : b.status === 'cancelled' ? 'Ακυρώθηκε' : 'Σε αναμονή'}
              </span>
            </div>
          </div>
          {onCancel && b.status === 'confirmed' && (
            <div className="booking-actions">
              <button className="btn-cancel-booking" onClick={() => onCancel(b.id)}>Ακύρωση Κράτησης</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
