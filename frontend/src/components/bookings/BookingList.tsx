import type { Booking } from '../../types/booking.types';
import { formatDate } from '../../utils/dateFormat';

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (id: string) => void;
}

export default function BookingList({ bookings, onCancel }: BookingListProps) {
  return (
    <ul className="booking-list">
      {bookings.map((b) => (
        <li key={b.id}>
          <span>Booking #{b.id.slice(0, 8)}</span>
          <span>Qty: {b.quantity}</span>
          <span>Total: €{b.totalPrice}</span>
          <span>{formatDate(b.createdAt)}</span>
          <span className={`status-${b.status}`}>{b.status}</span>
          {onCancel && b.status === 'confirmed' && (
            <button onClick={() => onCancel(b.id)}>Cancel</button>
          )}
        </li>
      ))}
    </ul>
  );
}
