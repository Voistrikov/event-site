import React, { useState } from 'react';
import { sendMessage } from '../../api/messagesApi';

interface MessageModalProps {
  recipientId: string;
  recipientName: string;
  subject: string;
  onClose: () => void;
}

export default function MessageModal({ recipientId, recipientName, subject, onClose }: MessageModalProps) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      setLoading(true);
      await sendMessage({ recipientId, subject, body });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch {
      alert('Αποτυχία αποστολής μηνύματος.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 11000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1b3858' }}>Επικοινωνία με {recipientName}</h2>
        
        {success ? (
          <div style={{ padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' }}>
            Το μήνυμα στάλθηκε επιτυχώς!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Θέμα</label>
              <input 
                type="text" 
                value={subject} 
                readOnly 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none' }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Μήνυμα</label>
              <textarea 
                rows={6}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Γράψτε το μήνυμά σας εδώ..."
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
              >
                Ακύρωση
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#34aadc', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {loading ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
