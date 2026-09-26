import { useMemo, useState } from 'react';
import type { Event, TicketType } from '../../types/event.types';
import ConfirmBookingDialog from './ConfirmBookingDialog';
import './TicketSelector.css';

interface TicketSelectorProps {
  event: Event;
  ticketTypes: TicketType[];
  onBook: (ticketTypeId: string, quantity: number) => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
}

export default function TicketSelector({ event, ticketTypes, onBook, disabled = false, loading = false }: TicketSelectorProps) {
  const availableTypes = ticketTypes.filter((ticket) => ticket.id);
  const [selectedType, setSelectedType] = useState(availableTypes[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const selected = useMemo(() => availableTypes.find((ticket) => ticket.id === selectedType), [availableTypes, selectedType]);

  const effectiveQuantity = Math.max(1, Math.min(quantity, selected?.available ?? 1));
  const totalPrice = selected ? Number(selected.price) * effectiveQuantity : 0;
  const unavailable = disabled || loading || !selected || selected.available < 1;

  return (
    <section className="ticket-selector" aria-label="Κράτηση εισιτηρίων">
      <h3>🎫 Κράτηση Εισιτηρίων</h3>
      {availableTypes.length === 0 && <p className="ticket-empty">Δεν υπάρχουν διαθέσιμοι τύποι εισιτηρίων.</p>}
      <div className="ticket-type-list">
        {availableTypes.map((ticket) => (
          <button key={ticket.id} type="button" className={`ticket-type-card ${selectedType === ticket.id ? 'selected' : ''}`} onClick={() => { setSelectedType(ticket.id!); setQuantity(1); }} disabled={disabled || ticket.available < 1}>
            <span className="ticket-name">{ticket.name}</span>
            <strong className="ticket-price">€{Number(ticket.price).toFixed(2)}</strong>
            <span className="ticket-available">{ticket.available} διαθέσιμα</span>
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="quantity-row">
            <label htmlFor="ticket-quantity">Αριθμός εισιτηρίων:</label>
            <input id="ticket-quantity" type="number" min={1} max={selected.available} value={effectiveQuantity} onChange={(e) => setQuantity(Math.max(1, Math.min(selected.available, Number(e.target.value) || 1)))} />
          </div>
          <div className="price-summary"><span>{effectiveQuantity} × €{Number(selected.price).toFixed(2)}</span><strong>€{totalPrice.toFixed(2)}</strong></div>
          <button type="button" className="ticket-book-button" disabled={unavailable} onClick={() => setShowConfirmation(true)}>{loading ? 'Υποβολή...' : selected.available ? 'Κράτηση Εισιτηρίων' : 'Εξαντλήθηκε'}</button>
        </>
      )}
      {showConfirmation && selected && (
        <ConfirmBookingDialog
          event={event}
          ticketType={selected}
          quantity={effectiveQuantity}
          totalCost={totalPrice}
          loading={loading}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={async () => { await onBook(selected.id!, effectiveQuantity); setShowConfirmation(false); }}
        />
      )}
    </section>
  );
}
