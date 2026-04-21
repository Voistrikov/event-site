import { useState, useEffect } from 'react';
import { getEvents } from '../api/eventsApi';
import type { Event } from '../types/event.types';

export function useEvents(params?: Record<string, unknown>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getEvents(params)
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { events, loading, error };
}
