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
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Εκδήλωση</th>
            <th>Τύπος</th>
            <th>Ημερομηνία</th>
            <th>Κατάσταση</th>
            <th>Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                Δεν υπάρχουν εκδηλώσεις.
              </td>
            </tr>
          ) : (
            events.map((e) => (
              <tr key={e.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {e.venue ? `${e.venue}, ${e.city}` : e.city || '—'}
                  </div>
                </td>
                <td>{eventTypeLabel(e.eventType)}</td>
                <td style={{ color: '#6b7280', fontSize: 13 }}>{formatDate(e.startDateTime)}</td>
                <td>
                  <span
                    className={
                      e.status === 'PUBLISHED'
                        ? 'badge badge-approved'
                        : e.status === 'DRAFT'
                        ? 'badge badge-pending'
                        : e.status === 'CANCELLED'
                        ? 'badge badge-rejected'
                        : 'badge badge-organizer'
                    }
                  >
                    {STATUS_LABELS[e.status] || e.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/events/${e.id}`} className="btn btn-secondary btn-sm">
                      Προβολή
                    </Link>
                    {(e.status === 'DRAFT' || e.status === 'PUBLISHED') && (
                      <Link to={`/events/${e.id}/edit`} className="btn btn-secondary btn-sm">
                        Επεξεργασία
                      </Link>
                    )}
                    {onPublish && e.status === 'DRAFT' && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => onPublish(e.id)}
                      >
                        Δημοσίευση
                      </button>
                    )}
                    {onComplete && e.status === 'PUBLISHED' && new Date(e.endDateTime) < new Date() && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onComplete(e.id)}
                      >
                        Ολοκλήρωση
                      </button>
                    )}
                    {onCancel && e.status === 'PUBLISHED' && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onCancel(e.id)}
                      >
                        Ακύρωση
                      </button>
                    )}
                    {onDelete &&
                      (e.status === 'DRAFT' ||
                        (e.status === 'PUBLISHED' && (e._count?.bookings ?? 0) === 0)) && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(e.id)}
                        >
                          Διαγραφή
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
