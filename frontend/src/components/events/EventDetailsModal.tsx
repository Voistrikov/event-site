import React, { useState } from 'react';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';
import { useAuth } from '../../hooks/useAuth';
import { createBooking } from '../../api/bookingsApi';
import { useNavigate } from 'react-router-dom';
import BookingCalendar from '../bookings/BookingCalendar';
import '../../styles/EventDetailsModal.css';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Images
  const defaultMainImage = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80';
  const imageUrl = event.photos && event.photos.length > 0 
    ? `http://localhost:3000/uploads/${event.photos[0].filename}` 
    : defaultMainImage;

  // Booking State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(1);

  const price = event.ticketTypes?.[0]?.price ? Number(event.ticketTypes[0].price) : 0;
  
  // Calculate nights safely
  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();
  const totalPrice = price * nights;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={e => e.stopPropagation()}>
        <button className="event-modal-close" onClick={onClose}>&times;</button>
        
        <div className="event-modal-header">
          <h2 className="event-modal-title">{event.title}</h2>
          <div className="event-modal-meta">
            <span>📍 {event.location || event.city}, {event.country}</span>
          </div>
        </div>

        <div className="event-modal-photos" style={{ padding: '20px 30px', height: '300px', display: 'flex', gap: '10px' }}>
          <img src={imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
        </div>

        <div className="event-modal-body" style={{ display: 'flex', gap: '30px', padding: '20px 30px 40px' }}>
          <div className="event-modal-description" style={{ flex: 1.5 }}>
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <strong>Χώρος:</strong> {event.capacity || 2} Επισκέπτες • {Math.max(1, Math.floor((event.capacity || 2) / 2))} Δωμάτια
            </div>
            <h3>Σχετικά με τον χώρο</h3>
            <p style={{ lineHeight: '1.6', color: '#444' }}>{event.description}</p>
          </div>

          <div className="event-modal-booking" style={{ flex: 1, background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '20px' }}>
              €{price} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666' }}>/ νύχτα</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <BookingCalendar 
                checkIn={checkIn} 
                checkOut={checkOut} 
                onDatesChange={(start, end) => {
                  setCheckIn(start);
                  setCheckOut(end);
                }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '6px' }}>Διανυκτερεύσεις</label>
                <input 
                  type="number" 
                  min="1" 
                  value={nights} 
                  onChange={e => {
                    if (!checkIn) return;
                    const val = parseInt(e.target.value) || 1;
                    const newEnd = new Date(checkIn);
                    newEnd.setDate(newEnd.getDate() + val);
                    setCheckOut(newEnd.toISOString().split('T')[0]);
                  }} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '6px' }}>Επισκέπτες</label>
                <input 
                  type="number" 
                  min="1" 
                  max={event.capacity || 10} 
                  value={guests} 
                  onChange={e => setGuests(parseInt(e.target.value) || 1)} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} 
                />
              </div>
            </div>

            {nights > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#444' }}>
                  <span>€{price} x {nights} νύχτες</span>
                  <span>€{totalPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <span>Σύνολο</span>
                  <span>€{totalPrice}</span>
                </div>
              </div>
            )}

            <button 
              className="modal-booking-btn"
              disabled={bookingLoading || nights <= 0}
              onClick={async () => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                try {
                  setBookingLoading(true);
                  await createBooking({
                    eventId: event.id,
                    ticketTypeId: event.ticketTypes?.[0]?.id || '',
                    quantity: guests,
                    checkIn,
                    checkOut
                  });
                  onClose();
                  navigate('/bookings');
                } catch (err) {
                  alert('Αποτυχία κράτησης. Δοκιμάστε ξανά.');
                } finally {
                  setBookingLoading(false);
                }
              }}
              style={{ background: '#34aadc', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', width: '100%', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}
            >
              {bookingLoading ? 'Γίνεται επεξεργασία...' : 'Κάντε Κράτηση'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
