import React from 'react';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';
import '../../styles/EventDetailsModal.css';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const defaultMainImage = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80';
  const defaultSubImage1 = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
  const defaultSubImage2 = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80';

  let mainImageUrl = defaultMainImage, subImageUrl1 = defaultSubImage1, subImageUrl2 = defaultSubImage2;
  if (event.photos && event.photos.length > 0) {
    mainImageUrl = `http://localhost:3000/uploads/${event.photos[0].filename}`;
    if (event.photos.length > 1) subImageUrl1 = `http://localhost:3000/uploads/${event.photos[1].filename}`;
    if (event.photos.length > 2) subImageUrl2 = `http://localhost:3000/uploads/${event.photos[2].filename}`;
  }

  const price = event.ticketTypes?.[0]?.price ? `€${event.ticketTypes[0].price}` : 'Free';
  const isAvailable = event.ticketTypes?.[0]?.available !== 0;

  const rooms = Math.max(1, Math.floor((event.capacity || 2) / 2));
  const beds = event.capacity || 2;
  const baths = Math.max(1, Math.floor(rooms / 2));

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={e => e.stopPropagation()}>
        <button className="event-modal-close" onClick={onClose}>&times;</button>
        
        <div className="event-modal-header">
          <h2 className="event-modal-title">{event.title}</h2>
          <div className="event-modal-meta">
            <span>📍 <strong>Τοποθεσία:</strong> {event.location || event.address || event.city}, {event.country}</span>
            <span>🗓️ {formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
        </div>

        <div className="event-modal-photos">
          <img src={mainImageUrl} alt="Main" className="modal-photo-main" />
          <div className="modal-photos-side">
            <img src={subImageUrl1} alt="Room detail" className="modal-photo-secondary" />
            <img src={subImageUrl2} alt="Balcony" className="modal-photo-secondary" />
          </div>
        </div>

        <div className="event-modal-body">
          <div className="event-modal-description">
            <div className="event-modal-rooms">
              <strong>Χώρος:</strong> {event.capacity || 2} Επισκέπτες • {rooms} Υπνοδωμάτια • {beds} Κρεβάτια • {baths} Μπάνια
            </div>
            
            <h3>Σχετικά με τον χώρο</h3>
            <p>{event.description || 'Καλώς ήρθατε σε αυτό το υπέροχο κατάλυμα. Ιδανικό για την επόμενη διαμονή σας, με εξαιρετικές παροχές και σε προνομιακή τοποθεσία.'}</p>
            
            <h3 style={{ marginTop: '20px' }}>Τι υπάρχει τριγύρω</h3>
            <p className="event-modal-nearby">
              Σε πολύ κοντινή απόσταση με τα πόδια θα βρείτε καφετέριες, εστιατόρια, στάσεις μέσων μαζικής μεταφοράς και τοπικά καταστήματα για τις καθημερινές σας ανάγκες. Η γειτονιά είναι ήσυχη και ασφαλής.
            </p>
          </div>

          <div className="event-modal-booking">
            <div className="modal-booking-price">
              {price} <span>/ βράδυ</span>
            </div>
            
            {/* Booking Calendar Mock */}
            <div className="custom-calendar">
              <div className="calendar-header-title">Διαθεσιμότητα: Μάιος 2026</div>
              <div className="calendar-grid">
                {['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ'].map((d, i) => (
                  <div key={i} className="calendar-day-name">{d}</div>
                ))}
                {Array(4).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="calendar-box empty"></div>
                ))}
                {Array.from({length: 31}, (_, i) => i + 1).map(d => {
                  // Mock some booked days
                  const isBooked = [12, 13, 14, 24, 25].includes(d);
                  return (
                    <div key={d} className={`calendar-box ${isBooked ? 'booked' : 'available'}`} title={isBooked ? 'Μη διαθέσιμο' : 'Διαθέσιμο'}>
                      {d}
                    </div>
                  );
                })}
              </div>
              <div className="calendar-legend">
                <span className="legend-item"><span className="box available"></span> Διαθέσιμο</span>
                <span className="legend-item"><span className="box booked"></span> Κλεισμένο</span>
              </div>
            </div>

            <button 
              className="modal-booking-btn"
              disabled={!isAvailable}
              onClick={() => {
                alert('Το σύστημα κρατήσεων θα επεξεργαστεί την κράτηση.');
              }}
            >
              {isAvailable ? 'Κάντε Κράτηση' : 'Μη Διαθέσιμο'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', color: '#6b7280', fontSize: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Οι συναλλαγές είναι κρυπτογραφημένες με SSL/TLS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
