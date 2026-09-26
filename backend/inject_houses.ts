import { PrismaClient } from './src/generated/prisma/client.js';
import * as dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
      },
      {
        id: 'prop-4-seaside-villa',
        title: 'Seaside Villa Glyfada',
        eventType: 'VILLA',
        venue: 'Private Villa',
        address: 'Poseidonos Ave 45',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.8632,
        longitude: 23.7554,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 8,
        status: 'PUBLISHED',
        description: 'A magnificent beachfront villa located in Glyfada. Includes a private pool, large garden, and direct access to the sea.',
      },
      {
        id: 'prop-5-exarcheia-loft',
        title: 'Urban Loft in Exarcheia',
        eventType: 'LOFT',
        venue: 'City Loft',
        address: 'Stournari 22',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9868,
        longitude: 23.7341,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 4,
        status: 'PUBLISHED',
        description: 'Industrial-style loft in the vibrant neighborhood of Exarcheia. Perfect for digital nomads and art lovers.',
      },
      {
        id: 'prop-6-kifisia-mansion',
        title: 'Classic Mansion in Kifisia',
        eventType: 'VILLA',
        venue: 'Historic Mansion',
        address: 'Kassaveti 12',
        city: 'Athens',
        country: 'Greece',
        latitude: 38.0754,
        longitude: 23.8152,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 10,
        status: 'PUBLISHED',
        description: 'Experience aristocratic living in this fully restored 19th-century mansion in the green suburbs of Kifisia.',
      },
      {
        id: 'prop-7-pireaus-apartment',
        title: 'Port View Apartment',
        eventType: 'APARTMENT',
        venue: 'Modern Apartment',
        address: 'Akti Miaouli 50',
        city: 'Piraeus',
        country: 'Greece',
        latitude: 37.9396,
        longitude: 23.6401,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 5,
        status: 'PUBLISHED',
        description: 'Wake up to the sound of the sea and watch the ships go by in this lovely port-side apartment.',
      },
      {
        id: 'prop-8-koukaki-home',
        title: 'Minimalist Home in Koukaki',
        eventType: 'APARTMENT',
        venue: 'Renovated Home',
        address: 'Veikou 60',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9649,
        longitude: 23.7251,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 3,
        status: 'PUBLISHED',
        description: 'A beautifully designed minimalist space in one of the most popular neighborhoods in Athens, just under the Acropolis.',
      },
      {
        id: 'prop-9-monastiraki-rooftop',
        title: 'Rooftop Oasis Monastiraki',
        eventType: 'PENTHOUSE',
        venue: 'Rooftop Apartment',
        address: 'Athinas 2',
        city: 'Athens',
        country: 'Greece',
        latitude: 37.9765,
        longitude: 23.7262,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 2,
        status: 'PUBLISHED',
        description: 'A cozy rooftop with a huge private terrace overlooking the flea market and the Acropolis.',
      },
      {
        id: 'prop-10-sounio-retreat',
        title: 'Cape Sounio Retreat',
        eventType: 'VILLA',
        venue: 'Seaside Retreat',
        address: 'Sounio Ave 100',
        city: 'Sounio',
        country: 'Greece',
        latitude: 37.6565,
        longitude: 24.0207,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 6,
        status: 'PUBLISHED',
        description: 'Escape the city in this beautiful retreat near the Temple of Poseidon. Breathtaking sunsets guaranteed.',
      },
      {
        id: 'prop-11-thessaloniki-center',
        title: 'Aristotelous Square Flat',
        eventType: 'APARTMENT',
        venue: 'City Center Flat',
        address: 'Aristotelous 10',
        city: 'Thessaloniki',
        country: 'Greece',
        latitude: 40.6322,
        longitude: 22.9405,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 4,
        status: 'PUBLISHED',
        description: 'Right in the heart of Thessaloniki, perfect for exploring the city, eating great food, and enjoying the nightlife.',
      },
      {
        id: 'prop-12-crete-villa',
        title: 'Stone Villa in Chania',
        eventType: 'VILLA',
        venue: 'Traditional Villa',
        address: 'Apokoronou 50',
        city: 'Chania',
        country: 'Greece',
        latitude: 35.5138,
        longitude: 24.0180,
        startDateTime: new Date(),
        endDateTime: defaultDate,
        capacity: 7,
        status: 'PUBLISHED',
        description: 'A traditional stone-built villa in Crete with modern amenities, a private pool, and olive groves all around.',
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
