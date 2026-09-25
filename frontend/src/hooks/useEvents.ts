import { useState, useEffect } from 'react';
import { getEvents } from '../api/eventsApi';
import type { Event } from '../types/event.types';

export function useEvents(params?: Record<string, unknown>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents(params)
      .then((res) => {
        // Backend returns either an array (legacy) or { events, totalPages }
        if (Array.isArray(res.data)) {
          setEvents(res.data);
          setTotalPages(1);
        } else {
          setEvents(res.data.events);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  return { events, loading, error, totalPages };
}
