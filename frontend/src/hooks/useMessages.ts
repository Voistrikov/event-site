import { useState, useEffect } from 'react';
import { getInbox, getSent } from '../api/messagingApi';
import type { Message } from '../types/message.types';

export function useMessages() {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [inboxRes, sentRes] = await Promise.all([getInbox(), getSent()]);
      setInbox(inboxRes.data);
      setSent(sentRes.data);
    } catch (err) {
      console.error('Failed to load messages', err);
      setInbox([]);
      setSent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { inbox, sent, loading, refresh };
}
