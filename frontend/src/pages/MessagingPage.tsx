import { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageInbox from '../components/messaging/MessageInbox';
import MessageSent from '../components/messaging/MessageSent';
import ComposeMessage from '../components/messaging/ComposeMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/MessagingPage.css';
import { deleteInboxMessage, deleteSentMessage, markMessageAsRead } from '../api/messagesApi';

export default function MessagingPage() {
  const [tab, setTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [replyInfo, setReplyInfo] = useState<{ recipientId: string; subject: string } | null>(null);
  const { inbox, sent, loading, refresh } = useMessages();

  const handleReply = (recipientId: string, subject: string) => {
    setReplyInfo({ recipientId, subject });
    setTab('compose');
  };

  const notifyMessageUpdate = () => window.dispatchEvent(new Event('messages-updated'));
  const removeInbox = async (id: string) => { await deleteInboxMessage(id); await refresh(); notifyMessageUpdate(); };
  const removeSent = async (id: string) => { await deleteSentMessage(id); await refresh(); };
  const markRead = async (id: string) => { await markMessageAsRead(id); await refresh(); notifyMessageUpdate(); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="messaging-page-container">
      <div className="messaging-header">
        <h1 className="messaging-title">Μηνύματα</h1>
      </div>
      
      <div className="messaging-layout">
        {/* Sidebar */}
        <aside className="messaging-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${tab === 'inbox' ? 'active' : ''}`} 
              onClick={() => setTab('inbox')}
            >
              <span className="nav-icon">📥</span> Εισερχόμενα
            </button>
            <button 
              className={`nav-item ${tab === 'sent' ? 'active' : ''}`} 
              onClick={() => setTab('sent')}
            >
              <span className="nav-icon">📤</span> Απεσταλμένα
            </button>
            <button 
              className={`nav-item ${tab === 'compose' ? 'active' : ''}`} 
              onClick={() => setTab('compose')}
            >
              <span className="nav-icon">✍️</span> Νέο Μήνυμα
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="messaging-content">
          <div className="content-header">
            <h2>
              {tab === 'inbox' && 'Εισερχόμενα Μηνύματα'}
              {tab === 'sent' && 'Απεσταλμένα Μηνύματα'}
              {tab === 'compose' && 'Δημιουργία Νέου Μηνύματος'}
            </h2>
          </div>
          <div className="content-body">
            {tab === 'inbox' && <MessageInbox messages={inbox} onReply={handleReply} onDelete={removeInbox} onRead={markRead} />}
            {tab === 'sent' && <MessageSent messages={sent} onDelete={removeSent} />}
            {tab === 'compose' && (
              <ComposeMessage 
                initialRecipientId={replyInfo?.recipientId}
                initialSubject={replyInfo?.subject}
                onSent={() => { 
                  refresh(); 
                  setTab('sent'); 
                  setReplyInfo(null);
                }} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
