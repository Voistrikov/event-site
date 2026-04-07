import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function run() {
  try {
    const ownerUser = await prisma.user.findUnique({ where: { username: 'owner' } }) || await prisma.user.findFirst();
    if (!ownerUser) {
      console.log("No valid user found to attach houses to.");
      process.exit(1);
    }

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
      }
    ];

    for (const prop of properties) {
      const { ...rest } = prop;
      await prisma.event.upsert({
        where: { id: prop.id },
        update: {
          ...rest,
          // Fixed types for Prisma
          status: 'PUBLISHED' as any,
        },
        create: {
          ...rest,
          status: 'PUBLISHED' as any,
          organizer: {
             connect: { id: ownerUser.id }
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
      console.log(`Property ${prop.title} injected.`);
    }

    console.log("All properties successfully injected into the database!");
  } catch (e) {
    console.error("DB Error:", e);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
