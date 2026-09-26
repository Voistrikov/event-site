import type { Event, TicketType } from '../../types/event.types';
import { formatDateTime } from '../../utils/dateFormat';

interface ConfirmBookingDialogProps {
  event: Event;
  ticketType: TicketType;
  quantity: number;
  totalCost: number;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function ConfirmBookingDialog({
  event,
  ticketType,
  quantity,
  totalCost,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmBookingDialogProps) {
  return (
    <div className="confirmation-overlay" role="presentation" onClick={onCancel}>
      <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-confirm-title" onClick={(click) => click.stopPropagation()}>
        <h4 id="booking-confirm-title">📋 Επιβεβαίωση Κράτησης</h4>
        <dl className="booking-confirm-summary">
          <div><dt>Εκδήλωση</dt><dd>{event.title}</dd></div>
          <div><dt>Ημερομηνία</dt><dd>{formatDateTime(event.startDateTime)}</dd></div>
          <div><dt>Χώρος</dt><dd>{event.venue}, {event.city}</dd></div>
          <div><dt>Τύπος εισιτηρίου</dt><dd>{ticketType.name}</dd></div>
          <div><dt>Ποσότητα</dt><dd>{quantity}</dd></div>
          <div><dt>Σύνολο</dt><dd>€{totalCost.toFixed(2)}</dd></div>
        </dl>
        <p className="booking-warning">⚠️ Η κράτηση <strong>δεν μπορεί να αναιρεθεί</strong> μετά την οριστική υποβολή.</p>
        <div className="dialog-buttons">
          <button type="button" onClick={onCancel} disabled={loading}>Πίσω</button>
          <button type="button" className="confirm-btn" disabled={loading} onClick={onConfirm}>{loading ? 'Υποβολή...' : 'Οριστική Υποβολή'}</button>
        </div>
      </div>
    </div>
  );
}
