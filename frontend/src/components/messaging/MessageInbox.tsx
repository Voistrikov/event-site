import type { Message } from '../../types/message.types';
import { formatDateTime } from '../../utils/dateFormat';

interface MessageInboxProps {
  messages: Message[];
}

export default function MessageInbox({ messages }: MessageInboxProps) {
  return (
    <ul className="message-list">
      {messages.map((m) => (
        <li key={m.id} className={m.read ? 'read' : 'unread'}>
          <strong>{m.subject}</strong>
          <span>{formatDateTime(m.createdAt)}</span>
          <p>{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
