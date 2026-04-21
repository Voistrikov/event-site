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
      setError('Αποτυχία αποστολής μηνύματος.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compose-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>ID Παραλήπτη</label>
        <input 
          className="form-input"
          value={recipientId} 
          onChange={(e) => setRecipientId(e.target.value)} 
          placeholder="Εισάγετε το ID του παραλήπτη" 
          required 
        />
      </div>

      <div className="form-group">
        <label>Θέμα</label>
        <input 
          className="form-input"
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Σύντομο θέμα" 
          required 
        />
      </div>

      <div className="form-group">
        <label>Μήνυμα</label>
        <textarea 
          className="form-textarea"
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Γράψτε το μήνυμά σας εδώ..." 
          required 
        />
      </div>

      <button type="submit" className="btn-send">
        <span>✈️</span> Αποστολή
      </button>
    </form>
  );
}
