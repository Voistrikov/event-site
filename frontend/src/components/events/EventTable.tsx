import { Link } from 'react-router-dom';
import type { Event } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';

interface EventTableProps {
  events: Event[];
  onDelete?: (id: string) => void;
}

export default function EventTable({ events, onDelete }: EventTableProps) {
  return (
    <table className="event-table">
      <thead>
        <tr>
          <th>Τίτλος</th>
          <th>Κατηγορία</th>
          <th>Ημερομηνία</th>
          <th>Ενέργειες</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td>{e.title}</td>
            <td>{e.category}</td>
            <td>{formatDate(e.startDate)}</td>
            <td>
              <Link to={`/events/${e.id}/edit`}>Επεξεργασία</Link>
              {onDelete && (
                <button onClick={() => onDelete(e.id)} style={{ marginLeft: '10px' }}>Διαγραφή</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
