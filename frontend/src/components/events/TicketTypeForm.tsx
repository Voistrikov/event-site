import { useState } from 'react';
import type { TicketType } from '../../types/event.types';

interface TicketTypeFormProps {
  onAdd: (ticket: Omit<TicketType, 'id' | 'available'>) => void;
}

export default function TicketTypeForm({ onAdd }: TicketTypeFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, price, quantity });
    setName('');
    setPrice(0);
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-type-form">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ονομασία εισιτηρίου" required />
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Τιμή" min={0} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="Ποσότητα" min={1} />
      <button type="submit">Προσθήκη Τύπου</button>
    </form>
  );
}
