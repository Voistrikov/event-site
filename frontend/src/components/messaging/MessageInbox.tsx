import type { Message } from '../../types/message.types';
import { formatDateTime } from '../../utils/dateFormat';

interface MessageInboxProps {
  messages: Message[];
  onReply?: (recipientId: string, subject: string) => void;
}

export default function MessageInbox({ messages, onReply }: MessageInboxProps) {
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
          {onReply && (
            <button 
              className="btn-message-reply"
              onClick={() => onReply(m.senderId, `Re: ${m.subject}`)}
              style={{ 
                marginTop: '10px', 
                padding: '5px 12px', 
                borderRadius: '4px', 
                border: '1px solid #34aadc', 
                background: 'transparent', 
                color: '#34aadc', 
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Απάντηση
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
