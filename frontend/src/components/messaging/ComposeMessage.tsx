import { useState } from 'react';
import { sendMessage } from '../../api/messagingApi';

interface ComposeMessageProps {
  onSent?: () => void;
  initialRecipientId?: string;
  initialSubject?: string;
}

export default function ComposeMessage({ onSent, initialRecipientId = '', initialSubject = '' }: ComposeMessageProps) {
  const [recipientId, setRecipientId] = useState(initialRecipientId);
  const [subject, setSubject] = useState(initialSubject);
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
          rows={4}
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Γράψτε το μήνυμά σας εδώ..." 
          required 
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" className="btn-send" style={{ flex: 1, justifyContent: 'center' }}>
          <span>✈️</span> Αποστολή
        </button>
        {initialRecipientId && (
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => onSent?.()} 
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: '1px solid #ddd', 
              background: '#fff', 
              color: '#666', 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Ακύρωση
          </button>
        )}
      </div>
    </form>
  );
}
