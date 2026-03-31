import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getRecommendations } from '../../api/recommendationsApi';
import EventCard from '../events/EventCard';
import type { Event } from '../../types/event.types';

export default function RecommendedEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getRecommendations().then((res: AxiosResponse<Event[]>) => setEvents(res.data));
  }, []);

  if (!events.length) return null;

  return (
    <section className="recommendations">
      <h2>Recommended for you</h2>
      <div className="events-grid">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
