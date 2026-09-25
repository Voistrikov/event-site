import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const eventCategories = [
  'Music', 'Sports', 'Theater', 'Conference', 'Seminar', 'Workshop',
  'Festival', 'Exhibition', 'Live Performance', 'Comedy', 'Cultural',
  'Networking', 'Education', 'Charity',
];

const events = [
  {
    id: 'event-contemporary-music', title: 'Συναυλία Σύγχρονης Μουσικής', eventType: 'CONCERT', venue: 'Θέατρο Πόλης', address: 'Λεωφόρος Κεντρική 25', city: 'Αθήνα', country: 'Greece', latitude: 37.9838, longitude: 23.7275,
    startDateTime: new Date('2026-12-12T20:30:00'), endDateTime: new Date('2026-12-12T23:00:00'), capacity: 350,
    description: 'Βραδιά με έργα σύγχρονων δημιουργών και καλεσμένους μουσικούς.',
    ticketTypes: [
      { id: 'ticket-contemporary-music-general', name: 'General Admission', price: 18, quantity: 250, available: 250 },
      { id: 'ticket-contemporary-music-student', name: 'Student', price: 12, quantity: 100, available: 100 },
    ], categories: ['Music', 'Live Performance'],
  },
  {
    id: 'event-ai-conference', title: 'Ημερίδα Τεχνητής Νοημοσύνης', eventType: 'CONFERENCE', venue: 'Εθνικό Μετσόβιο Πολυτεχνείο', address: 'Ηρώων Πολυτεχνείου 9', city: 'Αθήνα', country: 'Greece', latitude: 37.9784, longitude: 23.783,
    startDateTime: new Date('2026-11-15T09:00:00'), endDateTime: new Date('2026-11-15T18:00:00'), capacity: 200,
    description: 'Ημερίδα για τις τελευταίες εξελίξεις στην τεχνητή νοημοσύνη.',
    ticketTypes: [
      { id: 'ticket-ai-conference-standard', name: 'Standard', price: 25, quantity: 150, available: 150 },
      { id: 'ticket-ai-conference-vip', name: 'VIP', price: 50, quantity: 50, available: 50 },
    ], categories: ['Conference', 'Education'],
  },
  {
    id: 'event-antigone', title: 'Θεατρική Παράσταση: Αντιγόνη', eventType: 'THEATER', venue: 'Θέατρο Ηρώδου Αττικού', address: 'Διονυσίου Αρεοπαγίτου', city: 'Αθήνα', country: 'Greece', latitude: 37.9708, longitude: 23.7243,
    startDateTime: new Date('2026-10-20T21:00:00'), endDateTime: new Date('2026-10-20T23:30:00'), capacity: 500,
    description: 'Η κλασική τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.',
    ticketTypes: [
      { id: 'ticket-antigone-regular', name: 'Κανονικό', price: 30, quantity: 300, available: 300 },
      { id: 'ticket-antigone-student', name: 'Φοιτητικό', price: 15, quantity: 100, available: 100 },
      { id: 'ticket-antigone-vip', name: 'VIP', price: 60, quantity: 100, available: 100 },
    ], categories: ['Theater', 'Cultural'],
  },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('123', 12);
  const users = [
    { username: 'admin', firstName: 'System', lastName: 'Admin', email: 'admin@events.local', phone: '0000000000', address: 'N/A', city: 'N/A', country: 'GR', taxId: '000000000', role: 'ADMIN' as const },
    { username: 'organizer', firstName: 'Event', lastName: 'Organizer', email: 'organizer@events.local', phone: '2222222222', address: 'Organizer Street 1', city: 'Athens', country: 'GR', taxId: '222222222', role: 'ORGANIZER' as const },
    { username: 'customer', firstName: 'Customer', lastName: 'Test', email: 'customer@events.local', phone: '1111111111', address: 'Test Street 1', city: 'Athens', country: 'GR', taxId: '111111111', role: 'ATTENDEE' as const },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { passwordHash, role: user.role, status: 'APPROVED' },
      create: { ...user, passwordHash, status: 'APPROVED' },
    });
  }
  for (const name of eventCategories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const organizer = await prisma.user.findUniqueOrThrow({ where: { username: 'organizer' } });
  const categoryIds = new Map((await prisma.category.findMany({ where: { name: { in: eventCategories } } })).map(({ id, name }) => [name, id]));

  for (const event of events) {
    const { ticketTypes, categories, ...eventData } = event;
    await prisma.event.upsert({
      where: { id: event.id },
      update: { ...eventData, status: 'PUBLISHED', organizerId: organizer.id },
      create: { ...eventData, status: 'PUBLISHED', organizerId: organizer.id },
    });
    for (const ticketType of ticketTypes) {
      await prisma.ticketType.upsert({
        where: { id: ticketType.id }, update: { ...ticketType, eventId: event.id }, create: { ...ticketType, eventId: event.id },
      });
    }
    await prisma.eventCategory.deleteMany({ where: { eventId: event.id } });
    await prisma.eventCategory.createMany({ data: categories.map((name) => ({ eventId: event.id, categoryId: categoryIds.get(name)! })) });
  }

  console.log('Seed complete: event users, categories, and events created with password 123.');
}

main()
  .catch((error: unknown) => { console.error(error); process.exit(1); })
  .finally(() => { void prisma.$disconnect(); });
