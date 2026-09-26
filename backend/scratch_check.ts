import { prisma } from './src/config/prisma.js';

async function main() {
  const user = await prisma.user.findFirst();
  const event = await prisma.event.findFirst({ include: { ticketTypes: true } });
  
  if (!user || !event || !event.ticketTypes[0]) {
    console.log("Missing data for test");
    return;
  }

  console.log("Testing booking creation...");
  try {
    const booking = await prisma.booking.create({
      data: {
        eventId: event.id,
        userId: user.id,
        ticketTypeId: event.ticketTypes[0].id,
        numberOfTickets: 1,
        totalCost: event.ticketTypes[0].price,
        checkIn: new Date(),
        checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: 'CONFIRMED'
      }
    });
    console.log("Booking created successfully:", booking.id);
  } catch (err) {
    console.error("Booking creation failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
