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
          <th>Title</th>
          <th>Category</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td>{e.title}</td>
            <td>{e.category}</td>
            <td>{formatDate(e.startDate)}</td>
            <td>
              <Link to={`/events/${e.id}/edit`}>Edit</Link>
              {onDelete && (
                <button onClick={() => onDelete(e.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
