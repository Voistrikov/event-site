import { useState } from 'react';
import type { TicketType } from '../../types/event.types';

interface TicketTypeFormProps {
  onAdd: (ticket: Omit<TicketType, 'id' | 'available'>) => void;
}

export default function TicketTypeForm({ onAdd }: TicketTypeFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, price, capacity });
    setName('');
    setPrice(0);
    setCapacity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-type-form">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ticket name" required />
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" min={0} />
      <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} placeholder="Capacity" min={1} />
      <button type="submit">Add Ticket Type</button>
    </form>
  );
}
