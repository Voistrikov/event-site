import { Link } from 'react-router-dom';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.category}</p>
      <p>{event.location}</p>
      <p>{formatDate(event.startDate)}</p>
      <Link to={`/events/${event.id}`}>View details</Link>
    </div>
  );
}
