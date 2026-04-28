import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';

interface OrganizerBookingListProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: 'CONFIRMED' | 'REJECTED') => void;
}

export default function OrganizerBookingList({ bookings, onUpdateStatus }: OrganizerBookingListProps) {
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
              <span className="booking-detail-label">Κατάλυμα</span>
              <span className="booking-detail-value">{(b.event as any).title}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Επισκέπτης</span>
              <span className="booking-detail-value">{(b.user as any).firstName} {(b.user as any).lastName}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Check-in</span>
              <span className="booking-detail-value">{formatDate(b.checkIn)}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Check-out</span>
              <span className="booking-detail-value">{formatDate(b.checkOut)}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Σύνολο</span>
              <span className="booking-detail-value">€{b.totalCost}</span>
            </div>
            <div className="booking-detail">
              <span className={`booking-status status-${b.status.toLowerCase()}`}>
                {b.status === 'CONFIRMED' ? 'Επιβεβαιώθηκε' : 
                 b.status === 'CANCELLED' ? 'Ακυρώθηκε' : 
                 b.status === 'REJECTED' ? 'Απορρίφθηκε' : 'Σε αναμονή'}
              </span>
            </div>
          </div>
          
          {b.status === 'PENDING' && (
            <div className="booking-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                className="search-cta-btn" 
                style={{ background: '#4caf50', flex: 1 }}
                onClick={() => onUpdateStatus(b.id, 'CONFIRMED')}
              >
                Επιβεβαίωση
              </button>
              <button 
                className="btn-cancel-booking" 
                style={{ margin: 0, flex: 1 }}
                onClick={() => onUpdateStatus(b.id, 'REJECTED')}
              >
                Απόρριψη
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
