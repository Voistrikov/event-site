import type { Message } from '../../types/message.types';
import { formatDateTime } from '../../utils/dateFormat';

interface MessageSentProps {
  messages: Message[];
}

export default function MessageSent({ messages }: MessageSentProps) {
  return (
    <ul className="message-list">
      {messages.map((m) => (
        <li key={m.id}>
          <strong>{m.subject}</strong>
          <span>{formatDateTime(m.createdAt)}</span>
          <p>{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
