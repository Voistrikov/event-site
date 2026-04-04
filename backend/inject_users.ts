import { PrismaClient } from './src/generated/prisma/client.js';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function run() {
  try {
    const passwordHash = await bcrypt.hash('123', 12);
    const roles = ['ADMIN', 'ORGANIZER', 'ATTENDEE'];
    for (const role of roles) {
      const username = role.toLowerCase();
      await prisma.user.upsert({
        where: { username },
        update: { passwordHash, status: 'APPROVED' },
        create: {
          username,
          passwordHash,
          firstName: role,
          lastName: 'User',
          email: `${username}@events.local`,
          phone: '1234567890',
          address: 'N/A',
          city: 'N/A',
          country: 'GR',
          taxId: '123456789',
          role: role as any,
          status: 'APPROVED',
        }
      });
      console.log(`User ${username} created/updated successfully.`);
    }
    console.log("All users created/updated successfully.");
  } catch (e) {
    console.error("DB Error:", e);
    process.exit(1);
  }
}
run().then(() => process.exit(0));
