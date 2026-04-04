import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../.env') }); // also check root if needed

const prisma = new PrismaClient();

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

  console.log('Seed complete: admin, owner, and customer users updated to password 123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
