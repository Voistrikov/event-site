import { useState } from 'react';
import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';
import MessageModal from '../messages/MessageModal';

interface BookingListProps { bookings: Booking[]; }

export default function BookingList({ bookings }: BookingListProps) {
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
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1b3858' }}>{b.event?.title}</h3>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              📅 {b.event?.startDateTime ? formatDate(b.event.startDateTime) : '—'} · 📍 {b.event?.city}, {b.event?.country}
            </div>
          </div>
          <div className="booking-card-body">
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
          <div className="booking-actions" style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveMessage({
                recipientId: b.event?.organizer?.id ?? '',
                recipientName: b.event?.organizer?.firstName || 'Διοργανωτή',
                subject: `Ερώτηση για την κράτηση στην εκδήλωση ${b.event?.title}`
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
              Επικοινωνία με Διοργανωτή
            </button>
          </div>
        </li>
      ))}
    </ul>
    </>
  );
}
