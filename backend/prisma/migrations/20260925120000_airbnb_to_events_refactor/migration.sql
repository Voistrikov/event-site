/*
  Warnings:

  - This drops the accommodation-specific booking dates. Existing values cannot
    be recovered after the migration.
*/

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "checkIn",
DROP COLUMN "checkOut";

-- Bookings are final once submitted; there is no organizer approval step.
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- CreateTable
CREATE TABLE "event_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_views_userId_eventId_viewedAt_idx" ON "event_views"("userId", "eventId", "viewedAt");

-- AddForeignKey
ALTER TABLE "event_views" ADD CONSTRAINT "event_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_views" ADD CONSTRAINT "event_views_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
