import { useEffect, useState } from 'react';
import { getMyMessages } from '../api/messagesApi';
import { formatDate } from '../utils/dateFormat';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/MessagesPage.css';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; avatarUrl?: string };
  recipient: { firstName: string; lastName: string; avatarUrl?: string };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getMyMessages();
      setMessages(res.data);
      if (res.data.length > 0) setSelectedMessage(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <h2 className="messages-title">Μηνύματα</h2>
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">Δεν υπάρχουν μηνύματα.</div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id} 
                className={`message-item ${selectedMessage?.id === m.id ? 'active' : ''}`}
                onClick={() => setSelectedMessage(m)}
              >
                <div className="message-item-header">
                  <span className="message-item-name">{m.sender.firstName} {m.sender.lastName}</span>
                  <span className="message-item-date">{formatDate(m.createdAt)}</span>
                </div>
                <div className="message-item-subject">{m.subject}</div>
                <div className="message-item-snippet">{m.body.substring(0, 40)}...</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="message-view">
        {selectedMessage ? (
          <div className="message-content">
            <div className="message-header">
              <h1>{selectedMessage.subject}</h1>
              <div className="message-info">
                <span>Από: <strong>{selectedMessage.sender.firstName} {selectedMessage.sender.lastName}</strong></span>
                <span>Ημερομηνία: {formatDate(selectedMessage.createdAt)}</span>
              </div>
            </div>
            <div className="message-body">
              {selectedMessage.body}
            </div>
            <div className="message-footer">
              <button className="btn-reply" onClick={() => alert('Η λειτουργία απάντησης θα είναι σύντομα διαθέσιμη!')}>
                Απάντηση
              </button>
            </div>
          </div>
        ) : (
          <div className="select-prompt">
            Επιλέξτε ένα μήνυμα για προβολή
          </div>
        )}
      </div>
    </div>
  );
}
