import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/event.types';
import { eventTypeLabel } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
}

export default function EventCard({ event, onViewDetails }: EventCardProps) {
  const navigate = useNavigate();
  const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
  const imageUrl = event.photos && event.photos.length > 0 
    ? `http://localhost:3000/uploads/${event.photos[0].filename}` 
    : defaultImage;
    
  const statusLabels = { DRAFT: 'ΠΡΟΣΧΕΔΙΟ', PUBLISHED: 'ΔΗΜΟΣΙΕΥΜΕΝΗ', COMPLETED: 'ΟΛΟΚΛΗΡΩΜΕΝΗ', CANCELLED: 'ΑΚΥΡΩΜΕΝΗ' };
  const minPrice = event.ticketTypes?.length ? Math.min(...event.ticketTypes.map((ticket) => Number(ticket.price))) : null;
  const available = event.ticketTypes?.reduce((sum, ticket) => sum + ticket.available, 0) ?? 0;

  return (
    <div className="modern-event-card">
      <div className="event-card-image-wrapper">
        <img src={imageUrl} alt={event.title} className="event-card-image" />
        <span className="event-card-tag tag-red">{statusLabels[event.status]}</span>
        <span className="event-card-type">{eventTypeLabel(event.eventType)}</span>
      </div>
      
      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        
        <div className="event-card-details">
          <div className="event-card-row">
            {/* Location pin icon replacing location */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="event-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>{event.city}, {event.country}</span>
          </div>
          <div className="event-card-row">
            {/* Calendar icon replacing date */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="event-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{formatDate(event.startDateTime)}</span>
          </div>
          <div className="event-card-row"><span>💰</span><span>{minPrice == null ? 'Χωρίς εισιτήρια' : minPrice === 0 ? 'Δωρεάν' : `Από €${minPrice.toFixed(2)}`}</span></div>
          <div className="event-card-row"><span>🎫</span><span>{available} θέσεις διαθέσιμες</span></div>
        </div>

        <div className="event-card-footer">
          <button 
            className="event-card-btn" 
            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
            onClick={() => onViewDetails ? onViewDetails(event) : navigate(`/events/${event.id}`)}
          >
            Προβολή Εκδήλωσης
          </button>
        </div>
      </div>
    </div>
  );
}
