import { Link } from 'react-router-dom';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';
import { eventTypeLabel } from '../../types/event.types';

interface EventTableProps {
  events: Event[];
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const STATUS_LABELS = { DRAFT: 'Πρόχειρο', PUBLISHED: 'Δημοσιευμένη', COMPLETED: 'Ολοκληρωμένη', CANCELLED: 'Ακυρωμένη' } as const;

export default function EventTable({ events, onDelete, onPublish, onCancel, onComplete }: EventTableProps) {
  return (
    <table className="event-table">
      <thead>
        <tr>
          <th>Τίτλος</th>
          <th>Τύπος</th>
          <th>Ημερομηνία</th>
          <th>Κατάσταση</th>
          <th>Ενέργειες</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td>{e.title}</td>
            <td>{eventTypeLabel(e.eventType)}</td>
            <td>{formatDate(e.startDateTime)}</td>
            <td><span className={`event-table-status status-${e.status.toLowerCase()}`}>{STATUS_LABELS[e.status]}</span></td>
            <td>
              {(e.status === 'DRAFT' || e.status === 'PUBLISHED') && <Link to={`/events/${e.id}/edit`}>Επεξεργασία</Link>}
              {onPublish && e.status === 'DRAFT' && <button onClick={() => onPublish(e.id)} style={{ marginLeft: '10px' }}>Δημοσίευση</button>}
              {onCancel && e.status === 'PUBLISHED' && <button onClick={() => onCancel(e.id)} style={{ marginLeft: '10px' }}>Ακύρωση</button>}
              {onComplete && e.status === 'PUBLISHED' && new Date(e.endDateTime) < new Date() && <button onClick={() => onComplete(e.id)} style={{ marginLeft: '10px' }}>Ολοκλήρωση</button>}
              {onDelete && (e.status === 'DRAFT' || (e.status === 'PUBLISHED' && (e._count?.bookings ?? 0) === 0)) && (
                <button onClick={() => onDelete(e.id)} style={{ marginLeft: '10px' }}>Διαγραφή</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
