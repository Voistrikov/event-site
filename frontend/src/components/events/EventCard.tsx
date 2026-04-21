import { Link } from 'react-router-dom';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
}

export default function EventCard({ event, onViewDetails }: EventCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80';
  const imageUrl = event.photos && event.photos.length > 0 
    ? `http://localhost:3000/uploads/${event.photos[0].filename}` 
    : defaultImage;
    
  // Using explicit Greek tags from the request/design reference (e.g. ΠΡΟΣ ΕΝΟΙΚΙΑΣΗ)
  const statusTag = event.status === 'PUBLISHED' ? "ΕΝΟΙΚΙΑΖΕΤΑΙ" : "ΜΗ ΔΙΑΘΕΣΙΜΟ";
  const tagColor = "tag-red"; // Use red globally to match the red 'ΧΑΘΗΚΕ' visual

  return (
    <div className="modern-event-card">
      <div className="event-card-image-wrapper">
        <img src={imageUrl} alt={event.title} className="event-card-image" />
        <span className={`event-card-tag ${tagColor}`}>{statusTag}</span>
      </div>
      
      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        
        <div className="event-card-details">
          <div className="event-card-row">
            {/* Location pin icon replacing location */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="event-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>{event.location || event.city}, {event.country}</span>
          </div>
          <div className="event-card-row">
            {/* Calendar icon replacing date */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="event-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{event.startDateTime ? formatDate(event.startDateTime) : event.startDate ? formatDate(event.startDate) : 'Άγνωστη Ημ/νία'}</span>
          </div>
        </div>

        <div className="event-card-footer">
          <button 
            className="event-card-btn" 
            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
            onClick={(e) => { e.preventDefault(); onViewDetails?.(event); }}
          >
            Προβολή Αγγελίας
          </button>
        </div>
      </div>
    </div>
  );
}
