import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../.env') }); // also check root if needed

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('123', 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@events.local',
      phone: '0000000000',
      address: 'N/A',
      city: 'N/A',
      country: 'GR',
      taxId: '000000000',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  await prisma.user.upsert({
    where: { username: 'owner' },
    update: { passwordHash },
    create: {
      username: 'owner',
      passwordHash,
      firstName: 'Owner',
      lastName: 'Test',
      email: 'owner@events.local',
      phone: '2222222222',
      address: 'Owner Street 1',
      city: 'Athens',
      country: 'GR',
      taxId: '222222222',
      role: 'ORGANIZER',
      status: 'APPROVED',
    },
  });

  await prisma.user.upsert({
    where: { username: 'customer' },
    update: { passwordHash },
    create: {
      username: 'customer',
      passwordHash,
      firstName: 'Customer',
      lastName: 'Test',
      email: 'customer@events.local',
      phone: '1111111111',
      address: 'Test Street 1',
      city: 'Athens',
      country: 'GR',
      taxId: '111111111',
      role: 'ATTENDEE',
      status: 'APPROVED',
    },
  });

  // Create mock apartments (Events)
  const ownerUser = await prisma.user.findUnique({ where: { username: 'owner' } });
  
  if (ownerUser) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    const properties = [
      {
        id: 'prop-1-acropolis-view',
        title: 'Acropolis View Penthouse',
        eventType: 'APARTMENT',
        venue: 'Penthouse Apartment',
        address: 'Ermou 15',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9755,
        longitude: 23.7348,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 4,
        status: 'PUBLISHED',
        description: 'Enjoy a luxurious stay at our penthouse with an unobstructed view of the Acropolis. Perfect for families or couples seeking a romantic getaway in the heart of Athens.',
        organizerId: ownerUser.id,
      },
      {
        id: 'prop-2-plaka-studio',
        title: 'Cozy Studio in Plaka',
        eventType: 'STUDIO',
        venue: 'Ground Floor Studio',
        address: 'Adrianou 110',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9723,
        longitude: 23.7285,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 2,
        status: 'PUBLISHED',
        description: 'A charming, recently renovated studio located in the scenic neighborhood of Plaka. Experience authentic Athenian culture with cafes and historic sites just steps away.',
        organizerId: ownerUser.id,
      },
      {
        id: 'prop-3-kolonaki-suite',
        title: 'Modern Suite in Kolonaki',
        eventType: 'SUITE',
        venue: 'Luxury Suite',
        address: 'Patriarchou Ioakeim 4',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9781,
        longitude: 23.7431,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 3,
        status: 'PUBLISHED',
        description: 'Stay in the most premium neighborhood of Athens. This modern suite offers high-end amenities, walking distance to boutiques, and exclusive restaurants.',
        organizerId: ownerUser.id,
      }
    ];

    for (const prop of properties) {
      const { organizerId, ...rest } = prop;
      await prisma.event.upsert({
        where: { id: prop.id },
        update: {
          ...rest,
          // Handle Enums explicitly if TS complains
          status: 'PUBLISHED',
        },
        create: {
          ...rest,
          status: 'PUBLISHED',
          organizer: {
             connect: { id: organizerId }
          },
          ticketTypes: {
            create: {
              id: `ticket-${prop.id}`,
              name: 'Nightly Rate',
              price: prop.id === 'prop-1-acropolis-view' ? 120.00 : prop.id === 'prop-2-plaka-studio' ? 65.00 : 150.00,
              quantity: 1,
              available: 1
            }
          }
        }
      });
    }
    // Create mock bookings for algorithm demonstration
    const customerUser = await prisma.user.findUnique({ where: { username: 'customer' } });
    if (customerUser) {
      const ticket1 = await prisma.ticketType.findUnique({ where: { id: 'ticket-prop-1-acropolis-view' } });
      const ticket2 = await prisma.ticketType.findUnique({ where: { id: 'ticket-prop-2-plaka-studio' } });

      if (ticket1 && ticket2) {
        await prisma.booking.upsert({
          where: { id: 'mock-booking-1' },
          update: {},
          create: {
            id: 'mock-booking-1',
            eventId: 'prop-1-acropolis-view',
            userId: customerUser.id,
            ticketTypeId: ticket1.id,
            numberOfTickets: 1,
            totalCost: ticket1.price,
            status: 'CONFIRMED'
          }
        });

        await prisma.booking.upsert({
          where: { id: 'mock-booking-2' },
          update: {},
          create: {
            id: 'mock-booking-2',
            eventId: 'prop-2-plaka-studio',
            userId: customerUser.id,
            ticketTypeId: ticket2.id,
            numberOfTickets: 1,
            totalCost: ticket2.price,
            status: 'CONFIRMED'
          }
        });
      }
    }
  }

  console.log('Seed complete: admin, owner, and customer users updated to password 123. Mock properties and bookings added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
