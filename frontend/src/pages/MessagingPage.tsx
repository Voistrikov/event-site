import { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageInbox from '../components/messaging/MessageInbox';
import MessageSent from '../components/messaging/MessageSent';
import ComposeMessage from '../components/messaging/ComposeMessage';

export default function MessagingPage() {
  const [tab, setTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const { inbox, sent, loading, refresh } = useMessages();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="messaging-page">
      <h1 className="profile-page-title">Messages</h1>
      <nav>
        <button onClick={() => setTab('inbox')}>Inbox</button>
        <button onClick={() => setTab('sent')}>Sent</button>
        <button onClick={() => setTab('compose')}>Compose</button>
      </nav>
      {tab === 'inbox' && <MessageInbox messages={inbox} />}
      {tab === 'sent' && <MessageSent messages={sent} />}
      {tab === 'compose' && <ComposeMessage onSent={refresh} />}
    </div>
  );
}
