import { useState } from 'react';
import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';
import MessageModal from '../messages/MessageModal';

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (id: string) => void;
}

export default function BookingList({ bookings, onCancel }: BookingListProps) {
  const [activeMessage, setActiveMessage] = useState<{ recipientId: string; recipientName: string; subject: string } | null>(null);

  return (
    <>
      {activeMessage && (
        <MessageModal 
          recipientId={activeMessage.recipientId}
          recipientName={activeMessage.recipientName}
          subject={activeMessage.subject}
          onClose={() => setActiveMessage(null)}
        />
      )}
      <ul className="booking-list">
      {bookings.map((b) => (
        <li key={b.id} className="booking-card">
          <div className="booking-card-header">
            <span className="booking-id">Κράτηση #{b.id.slice(0, 8)}</span>
            <span className="booking-date">{formatDate(b.createdAt)}</span>
          </div>
          <div className="booking-card-info" style={{ padding: '15px', borderBottom: '1px solid #f0f0f0', background: '#f8fbff' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1b3858' }}>{(b.event as any)?.title}</h3>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              📍 {(b.event as any)?.city}, {(b.event as any)?.country}
            </div>
          </div>
          <div className="booking-card-body">
            {/* ... existing details ... */}
            <div className="booking-detail">
              <span className="booking-detail-label">Check-in</span>
              <span className="booking-detail-value">{formatDate(b.checkIn)}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Check-out</span>
              <span className="booking-detail-value">{formatDate(b.checkOut)}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Άτομα</span>
              <span className="booking-detail-value">{b.numberOfTickets}</span>
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
          <div className="booking-actions" style={{ display: 'flex', gap: '10px' }}>
            {onCancel && (b.status === 'CONFIRMED' || b.status === 'PENDING') && (
              <button className="btn-cancel-booking" onClick={() => onCancel(b.id)} style={{ flex: 1 }}>Ακύρωση</button>
            )}
            <button 
              onClick={() => setActiveMessage({
                recipientId: (b.event as any)?.organizer?.id,
                recipientName: (b.event as any)?.organizer?.firstName || 'Ιδιοκτήτη',
                subject: `Ερώτηση για την κράτηση στο ${(b.event as any)?.title}`
              })}
              className="btn-contact-owner"
              style={{ 
                flex: 1, 
                border: 'none',
                background: '#34aadc', 
                color: 'white', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontSize: '0.85rem', 
                textAlign: 'center',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Επικοινωνία με Ιδιοκτήτη
            </button>
          </div>
        </li>
      ))}
    </ul>
    </>
  );
}
