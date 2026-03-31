import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: await bcrypt.hash(process.env['ADMIN_PASSWORD'] ?? 'Admin@12345!', 12),
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

  console.log('Seed complete: admin user upserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
