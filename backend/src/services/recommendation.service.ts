import { prisma } from '../config/prisma.js';
import { BiasedMatrixFactorization } from './biased-matrix-factorization.js';

export { BiasedMatrixFactorization } from './biased-matrix-factorization.js';

// Global instance of the recommender
let recommender = new BiasedMatrixFactorization(10, 0.02, 0.1, 50);

export async function trainRecommender() {
  // Confirmed bookings are strong feedback; detail-page views are weaker
  // implicit feedback and let the model learn before a user books anything.
  const [bookings, eventViews] = await Promise.all([
    prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: { userId: true, eventId: true },
    }),
    prisma.eventView.findMany({
      select: { userId: true, eventId: true },
    }),
  ]);

  // One user-event pair must contribute at most one rating. A booking takes
  // precedence over any number of views of the same event.
  const interactions = new Map<string, { userId: string; itemId: string; rating: number }>();
  for (const booking of bookings) {
    interactions.set(`${booking.userId}:${booking.eventId}`, {
      userId: booking.userId,
      itemId: booking.eventId,
      rating: 5.0,
    });
  }
  for (const view of eventViews) {
    const key = `${view.userId}:${view.eventId}`;
    if (!interactions.has(key)) {
      interactions.set(key, {
        userId: view.userId,
        itemId: view.eventId,
        rating: 2.0,
      });
    }
  }

  recommender = new BiasedMatrixFactorization(10, 0.02, 0.1, 100);
  recommender.train(Array.from(interactions.values()));
}

export async function getRecommendations(userId: string | undefined) {
  // Retrain so recently recorded event views and bookings affect the result.
  // The assignment dataset is small enough for request-time training.
  await trainRecommender();

  // Apply eligibility rules before ranking. Filtering after taking the top
  // three could otherwise return too few results when a high-scoring event is
  // expired, already booked, or owned by the current user.
  const candidateEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDateTime: { gt: new Date() },
      ...(userId ? {
        organizerId: { not: userId },
        bookings: {
          none: {
            userId,
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
        },
      } : {}),
    },
    include: { ticketTypes: true, photos: true },
  });

  const recommendedItemIds = recommender.recommendForUser(
    userId ?? 'unknown-user',
    3,
    candidateEvents.map((event) => event.id),
  );
  const rank = new Map(recommendedItemIds.map((eventId, index) => [eventId, index]));

  return candidateEvents
    .filter((event) => rank.has(event.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
}
