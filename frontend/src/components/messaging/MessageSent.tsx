import type { Message } from '../../types/message.types';
import { formatDateTime } from '../../utils/dateFormat';

interface MessageSentProps {
  messages: Message[];
  onDelete?: (id: string) => void;
}

export default function MessageSent({ messages, onDelete }: MessageSentProps) {
  if (messages.length === 0) {
    return <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Δεν υπάρχουν απεσταλμένα μηνύματα.</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((m) => (
        <li key={m.id} className="message-item read">
          <div className="message-header">
            <span className="message-subject">{m.subject || '(Χωρίς Θέμα)'}</span>
            <span className="message-date">{formatDateTime(m.createdAt)}</span>
          </div>
          <p className="message-body">{m.body}</p>
          {onDelete && <button className="delete-btn" onClick={() => onDelete(m.id)}>🗑️ Διαγραφή</button>}
        </li>
      ))}
    </ul>
  );
}
