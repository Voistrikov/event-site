import { useState } from 'react';
import { sendMessage } from '../../api/messagingApi';

interface ComposeMessageProps {
  onSent?: () => void;
}

export default function ComposeMessage({ onSent }: ComposeMessageProps) {
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage({ recipientId, subject, body });
      setRecipientId('');
      setSubject('');
      setBody('');
      onSent?.();
    } catch {
      setError('Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compose-form">
      {error && <p className="error">{error}</p>}
      <input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="Recipient ID" required />
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body" required />
      <button type="submit">Send</button>
    </form>
  );
}
