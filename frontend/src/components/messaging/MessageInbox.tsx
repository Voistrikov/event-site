import type { Message } from '../../types/message.types';
import { formatDateTime } from '../../utils/dateFormat';

interface MessageInboxProps {
  messages: Message[];
}

export default function MessageInbox({ messages }: MessageInboxProps) {
  if (messages.length === 0) {
    return <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Δεν υπάρχουν εισερχόμενα μηνύματα.</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((m) => (
        <li key={m.id} className={`message-item ${m.read ? 'read' : 'unread'}`}>
          <div className="message-header">
            <span className="message-subject">{m.subject || '(Χωρίς Θέμα)'}</span>
            <span className="message-date">{formatDateTime(m.createdAt)}</span>
          </div>
          <p className="message-body">{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
