import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '../api/eventsApi';
import { createBooking } from '../api/bookingsApi';
import { useAuth } from '../hooks/useAuth';
import type { Event } from '../types/event.types';
import BookingCalendar from '../components/bookings/BookingCalendar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventMap from '../components/events/EventMap';
import { formatDate } from '../utils/dateFormat';
import '../styles/EventDetailsPage.css';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Date selection state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(id);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to fetch property details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event?.ticketTypes?.[0]) {
      const price = Number(event.ticketTypes[0].price);
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (end > start) {
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setTotalPrice(price * nights);
      } else {
        setTotalPrice(0);
      }
    }
  }, [event, checkIn, checkOut]);

  if (loading) return <LoadingSpinner />;
  if (error || !event) return <div className="p-8 text-center text-red-500">{error || 'Property not found'}</div>;

  // Placeholder images
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

  return (
    <div className="event-details-page">
      <h1 className="event-details-title">{event.title}</h1>
      
      <div className="event-details-header-meta">
        <span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {event.location || event.city}
        </span>
        <span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {formatDate(event.startDate)} - {formatDate(event.endDate)}
        </span>
      </div>

      <div className="event-details-photos">
        <img src={mainImageUrl} alt="Main" className="event-photo-main" />
        <img src={subImageUrl1} alt="Room detail" className="event-photo-secondary" />
        <img src={subImageUrl2} alt="Balcony" className="event-photo-secondary" />
      </div>

      <div className="event-details-content">
        <div className="event-details-left">
          
          <div className="event-host-info">
            <div className="host-avatar">H</div>
            <div className="host-details">
              <h3>Hosted by Property Manager</h3>
              <p>Top host • 10 years hosting</p>
            </div>
          </div>

          <div className="event-description-box">
            <h2>About this place</h2>
            <p>{event.description || 'Welcome to this beautiful property. Perfect for your next stay, featuring excellent amenities and a great location near the center.'}</p>
          </div>

          <div className="event-amenities">
            <h2>What this place offers</h2>
            <div className="amenity-list">
              <div className="amenity-item">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                 Fast Wifi
              </div>
              <div className="amenity-item">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                 Dedicated workspace
              </div>
              <div className="amenity-item">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                 Air conditioning
              </div>
              <div className="amenity-item">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                 Free parking on premises
              </div>
            </div>
          </div>

          {event.latitude && event.longitude && (
            <div className="map-container-details">
              <h2>Where you'll be</h2>
              <EventMap latitude={event.latitude} longitude={event.longitude} title={event.title} />
            </div>
          )}

        </div>

        <div className="event-details-right">
          <div className="booking-card">
            <div className="booking-price">
              {price} <span>/ night</span>
            </div>

            <div className="booking-calendar-wrapper" style={{ margin: '16px 0' }}>
              <BookingCalendar 
                checkIn={checkIn} 
                checkOut={checkOut} 
                bookedRanges={event.bookings || []}
                onDatesChange={(start, end) => {
                  setCheckIn(start);
                  setCheckOut(end);
                }} 
              />
            </div>

            <div className="booking-info-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', background: '#fff', padding: '10px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666' }}>Nights</label>
                <input 
                  type="number" 
                  min="1" 
                  value={checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1}
                  onChange={(e) => {
                    if (!checkIn) return;
                    const val = parseInt(e.target.value) || 1;
                    const newEnd = new Date(checkIn);
                    newEnd.setDate(newEnd.getDate() + val);
                    setCheckOut(newEnd.toISOString().split('T')[0]);
                  }}
                  style={{ border: 'none', width: '100%', fontSize: '14px', outline: 'none', background: 'transparent' }}
                />
              </div>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', background: '#fff', padding: '10px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666' }}>Guests</label>
                <input 
                  type="number" 
                  min="1" 
                  max={event.capacity || 10} 
                  value={guests} 
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  style={{ border: 'none', width: '100%', fontSize: '14px', outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            {checkIn && checkOut && (
              <div className="reservation-summary" style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: '#1b3858', border: '1px solid #bbdefb' }}>
                <div><strong>Committed:</strong> {formatDate(checkIn)} to {formatDate(checkOut)}</div>
                <div style={{ marginTop: '4px' }}><strong>Duration:</strong> {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} days</div>
              </div>
            )}
            
            <button 
              className="booking-btn"
              disabled={!isAvailable || bookingLoading || totalPrice === 0}
              onClick={async () => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                if (!event.ticketTypes?.[0]) return;
                
                try {
                  setBookingLoading(true);
                  await createBooking({
                    eventId: event.id,
                    ticketTypeId: event.ticketTypes[0].id,
                    quantity: guests,
                    checkIn,
                    checkOut
                  });
                  navigate('/bookings');
                } catch (err) {
                  alert('Αποτυχία κράτησης. Δοκιμάστε ξανά.');
                } finally {
                  setBookingLoading(false);
                }
              }}
            >
              {bookingLoading ? 'Processing...' : (isAvailable ? 'Book your stay' : 'Sold Out')}
            </button>
            
            {totalPrice > 0 && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>€{price} x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                  <span>€{totalPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '16px' }}>
                  <span>Total</span>
                  <span>€{totalPrice}</span>
                </div>
              </div>
            )}
            
            <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
