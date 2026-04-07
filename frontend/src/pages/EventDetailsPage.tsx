import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Event } from '../types/event.types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventMap from '../components/events/EventMap';
import { formatDate } from '../utils/dateFormat';
import '../styles/EventDetailsPage.css';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/public/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to fetch property details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

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
            
            <button 
              className="booking-btn"
              disabled={!isAvailable}
              onClick={() => {
                alert('Booking system will process this ticket type mock.');
                // Here we would ideally navigate to a booking flow / checkout
              }}
            >
              {isAvailable ? 'Book your stay' : 'Sold Out'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
